import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as crypto from "crypto";

admin.initializeApp();
const db = admin.firestore();

// API keys and settings - Use firebase functions:secrets:set CINETPAY_API_KEY / CINETPAY_SITE_ID
const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || "dummy_api_key"; 
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || "dummy_site_id"; 
const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/v2/payment";
const CINETPAY_CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

export const initiateCinetPayPayment = functions.https.onCall(async (data, context) => {
    const { eventId, amount, currency, type, returnUrl, participantId, voteCount } = data;
    
    // 1. Validation
    if (!eventId || !amount || !currency || !["ticket", "vote"].includes(type)) {
        throw new functions.https.HttpsError("invalid-argument", "Données invalides.");
    }

    if (type === "ticket") {
        const eventDoc = await db.collection("events").doc(eventId).get();
        if (!eventDoc.exists || (eventDoc.data()?.ticket_stock || 0) <= 0) {
            throw new functions.https.HttpsError("failed-precondition", "Billets épuisés.");
        }
    }

    // 2. Création de la transaction 'pending'
    const transactionRef = db.collection("transactions").doc();
    const transactionData: any = {
        event_id: eventId,
        amount: amount,
        currency: currency,
        status: "pending",
        type: type,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (type === "vote") {
        transactionData.participant_id = participantId;
        transactionData.vote_count = voteCount || 1;
    }
    
    await transactionRef.set(transactionData);

    // 3. Appel à l'API CinetPay
    try {
        const cinetpayPayload = {
            apikey: CINETPAY_API_KEY,
            site_id: CINETPAY_SITE_ID,
            transaction_id: transactionRef.id,
            amount: amount,
            currency: currency,
            description: `Achat pour l'événement ${eventId}`,
            notify_url: `https://${process.env.GCLOUD_PROJECT}.cloudfunctions.net/paymentCallback`,
            return_url: returnUrl || "https://blessing-event.web.app",
            channels: "ALL"
        };

        const response = await axios.post(CINETPAY_API_URL, cinetpayPayload, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.data.code !== '201') { 
             await transactionRef.update({ status: "failed", updated_at: admin.firestore.FieldValue.serverTimestamp() });
             throw new Error("Erreur initiation CinetPay: " + response.data.description);
        }

        return { 
            success: true, 
            transactionId: transactionRef.id, 
            paymentUrl: response.data.data.payment_url 
        };
    } catch (error: any) {
        console.error("Payment Initiation Error:", error);
        await transactionRef.update({ status: "failed", updated_at: admin.firestore.FieldValue.serverTimestamp() });
        throw new functions.https.HttpsError("internal", error.message || "Erreur lors de l'initiation du paiement CinetPay.");
    }
});

export const paymentCallback = functions.https.onRequest(async (req, res) => {
    const { cpm_trans_id } = req.body;

    if (!cpm_trans_id) {
        res.status(400).send("Bad Request: Missing transaction ID");
        return;
    }

    try {
        // Validation with CinetPay API
        const checkPayload = {
            apikey: CINETPAY_API_KEY,
            site_id: CINETPAY_SITE_ID,
            transaction_id: cpm_trans_id
        };
        const checkResponse = await axios.post(CINETPAY_CHECK_URL, checkPayload, {
            headers: { "Content-Type": "application/json" }
        });

        const transactionRef = db.collection("transactions").doc(cpm_trans_id);
        const transactionDoc = await transactionRef.get();

        if (!transactionDoc.exists) {
            res.status(404).send("Transaction not found");
            return;
        }

        const txData = transactionDoc.data();
        if (txData?.status !== "pending") {
            res.status(200).send("Already processed");
            return;
        }

        if (checkResponse.data.code === '00' && checkResponse.data.data.status === "ACCEPTED") {
            const updates: any = {
                status: "success",
                provider_reference: checkResponse.data.data.payment_method || "CINETPAY",
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            };

            const eventRef = db.collection("events").doc(txData.event_id);

            await db.runTransaction(async (t) => {
                const eventDoc = await t.get(eventRef);
                if (!eventDoc.exists) throw new Error("Event not found");

                if (txData.type === "ticket") {
                    updates.ticket_token = crypto.randomBytes(8).toString('hex').toUpperCase();
                    t.update(eventRef, {
                        ticket_stock: admin.firestore.FieldValue.increment(-1)
                    });
                } else if (txData.type === "vote") {
                    const eventData = eventDoc.data();
                    const voteCountToAdd = txData.vote_count || 1;
                    
                    if (eventData && eventData.participants) {
                        const updatedParticipants = eventData.participants.map((p: any) => {
                            if (p.id === txData.participant_id) {
                                return { ...p, voteCount: (p.voteCount || 0) + voteCountToAdd };
                            }
                            return p;
                        });
                        
                        t.update(eventRef, {
                            participants: updatedParticipants,
                            total_votes: admin.firestore.FieldValue.increment(voteCountToAdd)
                        });
                    } else {
                        t.update(eventRef, {
                            total_votes: admin.firestore.FieldValue.increment(voteCountToAdd)
                        });
                    }
                }
                t.update(transactionRef, updates);
            });
        } else {
            await transactionRef.update({
                status: "failed",
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("Callback Processing Error:", error);
        res.status(500).send("Internal Server Error");
    }
});
