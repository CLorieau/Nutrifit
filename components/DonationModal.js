import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { processDonation } from "../api/paymentAPI";

// ─── Palette identique au reste de l'app ───────────────────
const CARD_DARK = "#0A0A0A";
const ACCENT = "#A3FF3D";
const TEXT_MUTED = "#9CA3AF";

const PRESET_AMOUNTS = [
  { label: "5€", cents: 500 },
  { label: "10€", cents: 1000 },
  { label: "20€", cents: 2000 },
  { label: "50€", cents: 5000 },
];

// Cartes de test officielles Stripe
const TEST_CARDS = [
  { number: "4242 4242 4242 4242", label: "✅ Success" },
  { number: "4000 0000 0000 9995", label: "❌ Declined (insufficient funds)" },
  { number: "4000 0000 0000 0002", label: "❌ Declined (generic)" },
  { number: "5555 5555 5555 4444", label: "✅ Success (Mastercard)" },
];

export default function DonationModal({ visible, onClose }) {
  const [step, setStep] = useState("amount"); // "amount" | "card" | "processing" | "success" | "error"
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [declineCode, setDeclineCode] = useState(null);

  const resetModal = () => {
    setStep("amount");
    setSelectedAmount(null);
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setCardHolder("");
    setErrorMsg("");
    setPaymentIntentId(null);
    setDeclineCode(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // ── Formater le numéro de carte ────────────────────────────
  const formatCard = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  // ── Préremplir avec une carte de test ──────────────────────
  const fillTestCard = (number) => {
    setCardNumber(number);
    setExpiry("12/28");
    setCvc("123");
    setCardHolder("Test User");
  };

  // ── Soumettre → Stripe valide server-side ─────────────────
  const handlePay = async () => {
    const rawCard = cardNumber.replace(/\s/g, "");

    // Validation basique du formulaire (format uniquement)
    if (rawCard.length !== 16) {
      setErrorMsg("The card number must contain 16 digits.");
      return;
    }
    if (!expiry.includes("/") || expiry.length < 5) {
      setErrorMsg("Invalid expiry date (MM/YY format).");
      return;
    }
    if (cvc.length < 3) {
      setErrorMsg("The CVC must contain at least 3 digits.");
      return;
    }

    setErrorMsg("");
    setStep("processing");

    try {
      // ✅ Le backend envoie la carte à Stripe et retourne le vrai résultat
      const res = await processDonation(selectedAmount.cents, rawCard);
      const data = res.data;

      if (data.success) {
        setPaymentIntentId(data.payment_intent_id);
        setStep("success");
      } else {
        // Stripe a refusé la carte (vrai refus, pas une simulation locale)
        setErrorMsg(data.error || "Payment declined by Stripe.");
        setDeclineCode(data.decline_code || null);
        setStep("error");
      }
    } catch (err) {
      // Erreur HTTP (carte non reconnue, clé Stripe invalide, réseau…)
      const detail = err?.response?.data?.detail;
      setErrorMsg(detail || "Server connection error.");
      setStep("error");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* ─── Handle bar + bouton fermer ─── */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragBar} />
            {step !== "processing" && (
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* ════════ ÉTAPE 1 — Montant ════════ */}
          {step === "amount" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.iconCircle}>
                <Ionicons name="heart" size={32} color={ACCENT} />
              </View>
              <Text style={styles.title}>Make a donation 💚</Text>
              <Text style={styles.subtitle}>
                Support NutriFit's development.{"\n"}
                <Text style={styles.sandboxBadge}>
                  🧪 Sandbox mode — no real payment
                </Text>
              </Text>

              <Text style={styles.label}>Choose an amount:</Text>
              <View style={styles.amountsGrid}>
                {PRESET_AMOUNTS.map((a) => (
                  <TouchableOpacity
                    key={a.cents}
                    style={[
                      styles.amountBtn,
                      selectedAmount?.cents === a.cents && styles.amountBtnActive,
                    ]}
                    onPress={() => setSelectedAmount(a)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.amountBtnText,
                        selectedAmount?.cents === a.cents &&
                          styles.amountBtnTextActive,
                      ]}
                    >
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Info cartes de test */}
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>
                  <Ionicons name="information-circle-outline" size={13} />{" "}
                  Accepted Stripe test cards:
                </Text>
                {TEST_CARDS.map((c) => (
                  <Text key={c.number} style={styles.infoItem}>
                    {c.label}
                    {"  "}
                    <Text style={styles.infoCardNumber}>{c.number}</Text>
                  </Text>
                ))}
                <Text style={styles.infoNote}>
                  ⚠️ Any other number will be declined by Stripe.
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.ctaBtn,
                  !selectedAmount && styles.ctaBtnDisabled,
                ]}
                onPress={() => selectedAmount && setStep("card")}
                disabled={!selectedAmount}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaBtnText}>
                  Continue {selectedAmount ? `— ${selectedAmount.label}` : ""}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#000" />
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ════════ ÉTAPE 2 — Carte ════════ */}
          {step === "card" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep("amount")}
              >
                <Ionicons name="arrow-back" size={18} color={TEXT_MUTED} />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Payment Information</Text>
              <Text style={styles.subtitle}>
                Donation of{" "}
                <Text style={{ color: ACCENT, fontWeight: "800" }}>
                  {selectedAmount?.label}
                </Text>{" "}
                · Stripe Sandbox
              </Text>

              {/* Raccourcis cartes de test */}
              <Text style={styles.label}>Fill with a test card:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 20 }}
              >
                {TEST_CARDS.map((c) => (
                  <TouchableOpacity
                    key={c.number}
                    style={styles.testChip}
                    onPress={() => fillTestCard(c.number)}
                  >
                    <Text style={styles.testChipText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Formulaire */}
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={TEXT_MUTED}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Card Number</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="card-outline"
                  size={18}
                  color={TEXT_MUTED}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: "transparent" }]}
                  placeholder="4242 4242 4242 4242"
                  placeholderTextColor={TEXT_MUTED}
                  value={cardNumber}
                  onChangeText={(v) => setCardNumber(formatCard(v))}
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Expiry</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/AA"
                    placeholderTextColor={TEXT_MUTED}
                    value={expiry}
                    onChangeText={(v) => setExpiry(formatExpiry(v))}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>CVC</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={TEXT_MUTED}
                    value={cvc}
                    onChangeText={(v) =>
                      setCvc(v.replace(/\D/g, "").slice(0, 4))
                    }
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={handlePay}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color="#000"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.ctaBtnText}>
                  Simulate donation — {selectedAmount?.label}
                </Text>
              </TouchableOpacity>

              <Text style={styles.secureNote}>
                🔒 Validation via Stripe sandbox — no real data transmitted
              </Text>
            </ScrollView>
          )}

          {/* ════════ ÉTAPE 3 — Traitement ════════ */}
          {step === "processing" && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={ACCENT} />
              <Text style={styles.processingText}>Processing Stripe…</Text>
              <Text style={styles.processingSubtext}>
                The server is validating your card in sandbox mode
              </Text>
            </View>
          )}

          {/* ════════ ÉTAPE 4 — Succès ════════ */}
          {step === "success" && (
            <View style={styles.centerContent}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={44} color="#000" />
              </View>
              <Text style={styles.title}>Simulated donation! 🎉</Text>
              <Text style={styles.subtitle}>
                Your donation of{" "}
                <Text style={{ color: ACCENT, fontWeight: "800" }}>
                  {selectedAmount?.label}
                </Text>{" "}
                has been validated by Stripe.
              </Text>
              {paymentIntentId && (
                <Text style={styles.piText}>
                  PaymentIntent : {paymentIntentId.slice(0, 24)}…
                </Text>
              )}
              <Text style={styles.sandboxBadge}>
                🧪 No real payment was made
              </Text>
              <TouchableOpacity
                style={[styles.ctaBtn, { marginTop: 28 }]}
                onPress={handleClose}
              >
                <Text style={styles.ctaBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ════════ ÉTAPE 5 — Erreur ════════ */}
          {step === "error" && (
            <View style={styles.centerContent}>
              <View style={styles.errorCircle}>
                <Ionicons name="close" size={44} color="#fff" />
              </View>
              <Text style={styles.title}>Payment declined</Text>
              <Text style={styles.subtitle}>{errorMsg}</Text>
              {declineCode && (
                <Text style={styles.declineCode}>Code: {declineCode}</Text>
              )}
              <TouchableOpacity
                style={[styles.ctaBtn, { marginTop: 20 }]}
                onPress={() => {
                  setStep("card");
                  setErrorMsg("");
                  setDeclineCode(null);
                }}
              >
                <Text style={styles.ctaBtnText}>Try again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleClose}>
                <Text style={styles.outlineBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: CARD_DARK,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "92%",
  },
  sheetHeader: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragBar: {
    width: 40,
    height: 4,
    backgroundColor: "#2A2A2A",
    borderRadius: 2,
  },
  closeBtn: {
    position: "absolute",
    right: 0,
    top: 8,
    padding: 6,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(163,255,61,0.12)",
    borderWidth: 1.5,
    borderColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: "500",
  },
  sandboxBadge: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  label: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  amountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  amountBtn: {
    flex: 1,
    minWidth: "40%",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: "#111",
  },
  amountBtnActive: {
    borderColor: ACCENT,
    backgroundColor: "rgba(163,255,61,0.08)",
  },
  amountBtnText: {
    color: TEXT_MUTED,
    fontSize: 20,
    fontWeight: "800",
  },
  amountBtnTextActive: {
    color: ACCENT,
  },
  infoBox: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#222",
  },
  infoTitle: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoItem: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 20,
  },
  infoCardNumber: {
    color: "#fff",
    fontWeight: "700",
  },
  infoNote: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8,
  },
  ctaBtn: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  ctaBtnDisabled: {
    opacity: 0.4,
  },
  ctaBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backBtnText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: "600",
  },
  testChip: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#111",
  },
  testChipText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 16,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  errorText: {
    color: "#FF4D4D",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  secureNote: {
    color: TEXT_MUTED,
    fontSize: 12,
    textAlign: "center",
    marginTop: 14,
  },
  centerContent: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  processingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
  },
  processingSubtext: {
    color: TEXT_MUTED,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FF4D4D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  piText: {
    color: "#555",
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },
  declineCode: {
    color: "#FF4D4D",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 12,
  },
  outlineBtnText: {
    color: TEXT_MUTED,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
