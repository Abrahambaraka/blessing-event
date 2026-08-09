import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as crypto from "crypto";

admin.initializeApp();
const db = admin.firestore();

// Note: Ensure to set this env variable via `firebase functions:secrets:set FLEXPAY_API_KEY`
// For testing purposes, we fall back to a dummy key if not set.
const FLEXPAY_API_URL = "https://api.flexpay.cd/v1/pay";
const FLEXPAY_API_KEY = process.env.FLEXPAY_API_KEY || "dummy_api_key_for_testing"; 

export const initiateMobileMoneyPayment = functions.https.onCall(async (data, context) => {
    const { eventId, phone, amount, currency, type } = data;
    
    // 1. Validation
    if (!eventId || !phone || !amount || !currency || !["ticket", "vote"].includes(type)) {
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
    const transactionData = {
        event_id: eventId,
        user_phone: phone,
        amount: amount,
        currency: currency,
        status: "pending",
        type: type,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await transactionRef.set(transactionData);

    // 3. Appel à l'API FlexPay
    try {
        const flexpayPayload = {
            merchant: "VOTRE_MERCHANT_ID",
            reference: transactionRef.id,
            phone: phone,
            amount: amount,
            currency: currency,
            callbackUrl: `https://${process.env.GCLOUD_PROJECT}.cloudfunctions.net/paymentCallback`
        };

        const response = await axios.post(FLEXPAY_API_URL, flexpayPayload, {
            headers: {
                "Authorization": `Bearer ${FLEXPAY_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (response.data.code !== '0' && response.data.code !== 0) { 
             await transactionRef.update({ status: "failed", updated_at: admin.firestore.FieldValue.serverTimestamp() });
             throw new Error("Erreur initiation FlexPay: " + response.data.message);
        }

        return { success: true, transactionId: transactionRef.id, message: "Push envoyé." };
    } catch (error: any) {
        console.error("Payment Initiation Error:", error);
        await transactionRef.update({ status: "failed", updated_at: admin.firestore.FieldValue.serverTimestamp() });
        throw new functions.https.HttpsError("internal", error.message || "Erreur lors de l'initiation du paiement.");
    }
});

export const paymentCallback = functions.https.onRequest(async (req, res) => {
    const { reference, status, amount, transaction_id } = req.body;

    if (!reference || !status) {
        res.status(400).send("Bad Request");
        return;
    }

    try {
        const transactionRef = db.collection("transactions").doc(reference);
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

        if (status === "success" || status === "successful") {
            const updates: any = {
                status: "success",
                provider_reference: transaction_id || null,
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
                    t.update(eventRef, {
                        total_votes: admin.firestore.FieldValue.increment(1)
                    });
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
