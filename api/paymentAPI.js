import api from "./axiosInstance";

/**
 * Envoie le numéro de carte + montant au backend.
 * Stripe valide la carte server-side et retourne le vrai résultat.
 * @param {number} amountCents - Montant en centimes (500, 1000, 2000, 5000)
 * @param {string} cardNumber  - Numéro de carte de test Stripe (sans espaces)
 * @param {string} currency    - Devise (default: "eur")
 */
export const processDonation = (amountCents, cardNumber, currency = "eur") =>
  api.post("/payment/donate", {
    amount: amountCents,
    card_number: cardNumber.replace(/\s/g, ""),
    currency,
  });
