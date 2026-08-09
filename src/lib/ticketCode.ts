/** Génère un code billet unique et non devinable */
export function generateTicketCode(): string {
  const segment = () => crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `BE-${segment()}-${segment()}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}
