import type { Order, Ticket } from '../../src/types/ticketing';
import { formatPrice } from '../../src/lib/fees';
import { SITE_CONTACT } from '../../src/constants/contact';

function siteUrl(): string {
  return (
    process.env.SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://blessing-event.com')
  );
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? `Blessing Event <${SITE_CONTACT.email}>`;
}

function notificationEmail(): string {
  return process.env.NOTIFICATION_EMAIL ?? SITE_CONTACT.email;
}

function recipients(order: Order): { to: string[]; bcc?: string[] } {
  const admin = notificationEmail().trim().toLowerCase();
  const buyer = order.buyerEmail.trim().toLowerCase();
  const to = buyer === admin ? [admin] : [buyer];
  const bcc = buyer === admin ? undefined : [admin];
  return { to, bcc };
}

function formatEventDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function buildTicketRowsHtml(tickets: Ticket[]): string {
  return tickets
    .map(
      (t) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${t.ticketTypeName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${t.holderName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-weight:bold;">${t.code}</td>
      </tr>`
    )
    .join('');
}

function buildHtml(order: Order, tickets: Ticket[]): string {
  const myTicketsUrl = `${siteUrl()}/#my-tickets`;
  const firstTicket = tickets[0];

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>Confirmation — ${order.eventTitle}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,'Times New Roman',serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#0a1628;padding:28px 32px;">
            <h1 style="margin:0;color:#c9a227;font-size:22px;font-weight:normal;">Blessing Event</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">Confirmation de réservation</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;">Bonjour <strong>${order.buyerName}</strong>,</p>
            <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
              Votre commande pour <strong>${order.eventTitle}</strong> est confirmée.
              ${firstTicket ? ` Retrouvez vos billets ci-dessous ou sur votre espace client.` : ''}
            </p>

            ${
              firstTicket
                ? `<p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Événement</p>
            <p style="margin:0 0 4px;font-size:15px;"><strong>${firstTicket.eventTitle}</strong></p>
            <p style="margin:0 0 4px;color:#475569;">${formatEventDate(firstTicket.eventDate)}</p>
            <p style="margin:0 0 24px;color:#475569;">${firstTicket.venue}</p>`
                : ''
            }

            <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Récapitulatif</p>
            <p style="margin:0 0 24px;font-size:15px;">
              Total payé : <strong>${formatPrice(order.total, order.currency)}</strong>
              · Commande <span style="font-family:monospace;">${order.id.slice(0, 8)}…</span>
            </p>

            ${
              tickets.length > 0
                ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:28px;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th align="left" style="padding:8px 12px;font-size:12px;color:#64748b;">Type</th>
                  <th align="left" style="padding:8px 12px;font-size:12px;color:#64748b;">Participant</th>
                  <th align="left" style="padding:8px 12px;font-size:12px;color:#64748b;">Code billet</th>
                </tr>
              </thead>
              <tbody>${buildTicketRowsHtml(tickets)}</tbody>
            </table>`
                : ''
            }

            <a href="${myTicketsUrl}" style="display:inline-block;background:#0a1628;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:13px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;">
              Voir mes billets
            </a>

            <p style="margin:28px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
              Présentez le QR code de votre e-billet à l'entrée. Pour toute question :
              <a href="mailto:info@blessing-event.com" style="color:#c9a227;">info@blessing-event.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildText(order: Order, tickets: Ticket[]): string {
  const lines = [
    `Bonjour ${order.buyerName},`,
    '',
    `Votre commande pour « ${order.eventTitle} » est confirmée.`,
    `Total : ${formatPrice(order.total, order.currency)}`,
    '',
    'Vos billets :',
    ...tickets.map((t) => `- ${t.ticketTypeName} · ${t.holderName} · ${t.code}`),
    '',
    `Consultez vos billets : ${siteUrl()}/#my-tickets`,
    '',
    'Blessing Event — info@blessing-event.com',
  ];
  return lines.join('\n');
}

/** Envoie l'email de confirmation. Retourne false si Resend non configuré (sans bloquer). */
export async function sendOrderConfirmationEmail(order: Order, tickets: Ticket[]): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY absent — email non envoyé.');
    return false;
  }

  const { to, bcc } = recipients(order);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress(),
      to,
      ...(bcc ? { bcc } : {}),
      subject: `Vos billets — ${order.eventTitle}`,
      html: buildHtml(order, tickets),
      text: buildText(order, tickets),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('[email] Resend error:', response.status, body);
    return false;
  }

  return true;
}
