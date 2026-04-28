import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Image,
  Modal,
  Switch,
  TextInput,
} from "react-native";
import { getProfile } from "../api/profileAPI";
import { getSharedRecipes, getSocialStats } from "../api/social";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthContext from "../AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useChat } from "../ChatContext";
import DonationModal from "./DonationModal";
import { useBlindMode } from "../BlindModeContext";

// ─── Palette identique aux autres écrans ───────────────────────────────────
const BG = "#F7F7F9"; // fond général
const CARD_DARK = "#0A0A0A"; // cartes sombres
const CARD_BG = "#1A1A1A"; // surfaces secondaires dans les cartes sombres
const ACCENT = "#A3FF3D"; // vert lime
const TEXT_MUTED = "#9CA3AF"; // gris texte secondaire

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { signOut } = useContext(AuthContext);
  const navigation = useNavigation();
  const { openChat } = useChat();
  const { blindMode, toggleBlindMode } = useBlindMode();

  // Fonctionnalité 3 : Bouton Pause (mode expérimental statique)
  const [showPauseModal, setShowPauseModal] = React.useState(false);
  const [accountPaused, setAccountPaused] = React.useState(false);

  // Fonctionnalité 5 : Suppression RGPD
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const [deleteStep, setDeleteStep] = React.useState(1); // 1=avertissement, 2=confirmation texte
  const [deletingAccount, setDeletingAccount] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [friendsCount, setFriendsCount] = React.useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);
  const [sharedRecipes, setSharedRecipes] = React.useState([]);
  const [showDonation, setShowDonation] = React.useState(false);
  const [userData, setUserData] = React.useState({
    prenom: "",
    nom: "",
    age: 0,
    objectif: "",
    poids_kg: 0,
    taille_cm: 0,
    sexe: "masculin",
    nb_jours_entrainement: 0,
  });

  const fetchUserData = async () => {
    try {
      const response = await getProfile();
      setUserData(response.data);
      const sharedRes = await getSharedRecipes();
      setSharedRecipes(sharedRes.data || []);
      if (response.data?.id_utilisateur) {
        try {
          const statsRes = await getSocialStats(response.data.id_utilisateur);
          setFriendsCount(statsRes.data?.friends_count || 0);
        } catch (e) {
          console.log("Stats error:", e);
        }
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charge les demandes d'amis en attente (pour la pastille dynamique)
  const fetchPendingRequests = async () => {
    try {
      const { getPendingRequests } = await import("../api/social");
      const res = await getPendingRequests();
      setPendingRequestsCount(res.data?.length || 0);
    } catch (e) {
      // Silencieux si l'endpoint n'existe pas encore
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      fetchPendingRequests();
    }, []),
  );

  // Calcul calories — Mifflin-St Jeor
  const calculateCalories = (user) => {
    if (!user.poids_kg || !user.taille_cm || !user.age) return { total: 2000 };
    let bmr = 10 * user.poids_kg + 6.25 * user.taille_cm - 5 * user.age;
    bmr += user.sexe === "feminin" ? -161 : 5;
    let mult = 1.2;
    if (user.nb_jours_entrainement >= 1 && user.nb_jours_entrainement <= 3)
      mult = 1.375;
    else if (user.nb_jours_entrainement >= 4 && user.nb_jours_entrainement <= 5)
      mult = 1.55;
    else if (user.nb_jours_entrainement >= 6) mult = 1.725;
    return { total: Math.round(bmr * mult) };
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") return;
    setDeletingAccount(true);
    try {
      const api = require("../api/axiosInstance").default;
      await api.delete("/users/me");
      setShowDeleteModal(false);
      await signOut();
    } catch (e) {
      Alert.alert("Error", "Unable to delete account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  const { total: totalCalories } = calculateCalories(userData);

  const displayName = userData.prenom
    ? `${userData.prenom} ${userData.nom || ""}`.trim()
    : "User";

  const initials = userData.prenom
    ? `${userData.prenom[0] || ""}${userData.nom?.[0] || ""}`.toUpperCase()
    : "?";

  const bmi =
    userData.poids_kg && userData.taille_cm
      ? (userData.poids_kg / Math.pow(userData.taille_cm / 100, 2)).toFixed(1)
      : "—";

  const goalMap = {
    prise_de_masse: "Muscle gain",
    perte_de_poids: "Weight loss",
    maintien: "Maintenance",
  };
  const goalLabel =
    goalMap[userData.objectif] || userData.objectif || "Not set";
  const goalEmoji =
    {
      prise_de_masse: "💪",
      perte_de_poids: "🔥",
      maintien: "⚖️",
    }[userData.objectif] || "🎯";

  const menuItems = [
    {
      id: "friends",
      icon: "people-outline",
      label: "My Friends",
      // Pastille = demandes EN ATTENTE uniquement (cohérent avec la nav bar)
      // Le nombre total d'amis (friendsCount) est affiché dans la section stats du profil
      badge: pendingRequestsCount > 0 ? String(pendingRequestsCount) : null,
      danger: false,
      onPress: () => navigation.navigate("Community"),
    },
    {
      id: "favs",
      icon: "heart-outline",
      label: "Favorites",
      badge: null,
      danger: false,
      onPress: () => navigation.navigate("Favorites"),
    },
    {
      id: "edit",
      icon: "create-outline",
      label: "Edit Profile",
      badge: null,
      danger: false,
      onPress: () => navigation.navigate("EditProfile", { userData }),
    },
    {
      id: "donate",
      icon: "heart-outline",
      label: "Make a donation",
      badge: "🧪",
      danger: false,
      accent: true,
      onPress: () => setShowDonation(true),
    },
    {
      id: "logout",
      icon: "log-out-outline",
      label: "Log out",
      badge: null,
      danger: true,
      onPress: handleLogout,
    },
  ];

  // Fonctionnalité 1 : item Mode Aveugle avec Switch intégré (rendu séparé, pas dans FlatList)
  // Fonctionnalité 3 : item Pause avec badge "Expérimental"
  // Ces deux items sont rendus dans une section Settings dédiée sous le menu principal.

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
      {/* ─── HEADER — identique aux autres écrans ─── */}
      <View style={styles.header}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <TouchableOpacity style={styles.addButton} onPress={openChat}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ─── IDENTITY CARD ─── */}
      <View style={[styles.sectionContainer, { marginBottom: 0 }]}>
        <Text style={styles.sectionTitle}>Profile</Text>
      </View>
      <View style={styles.identityCard}>
        {/* Avatar */}
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        </View>

        {/* Nom + détails */}
        <Text style={styles.identityName}>{displayName}</Text>
        <Text style={styles.identitySub}>
          {userData.age ? `${userData.age} y.o.` : ""}
          {userData.age && userData.sexe ? " · " : ""}
          {userData.sexe === "feminin"
            ? "Female"
            : userData.sexe === "masculin"
              ? "Male"
              : ""}
        </Text>

        {/* Chip amis */}
        <TouchableOpacity
          style={styles.friendsChip}
          onPress={() => navigation.navigate("Community")}
        >
          <Ionicons name="people" size={13} color={ACCENT} />
          <Text style={styles.friendsChipText}>
            {friendsCount} friend{friendsCount !== 1 ? "s" : ""}
          </Text>
          <Ionicons name="chevron-forward" size={13} color={ACCENT} />
        </TouchableOpacity>

        {/* Bouton modifier */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditProfile", { userData })}
        >
          <Ionicons name="create-outline" size={15} color="#fff" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* ─── STATS ROW ─── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons
            name="scale-outline"
            size={18}
            color={ACCENT}
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.statValue}>{userData.poids_kg || "—"}</Text>
          <Text style={styles.statUnit}>kg</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name="resize-outline"
            size={18}
            color={ACCENT}
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.statValue}>{userData.taille_cm || "—"}</Text>
          <Text style={styles.statUnit}>cm</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name="body-outline"
            size={18}
            color={ACCENT}
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.statValue}>{bmi}</Text>
          <Text style={styles.statUnit}>BMI</Text>
        </View>
      </View>

      {/* ─── GOAL ─── */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Goal</Text>
        <View style={styles.goalCard}>
          <View style={styles.goalTop}>
            <View style={styles.goalEmojiBox}>
              <Text style={{ fontSize: 22 }}>{goalEmoji}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.goalLabel}>{goalLabel}</Text>
              <Text style={styles.goalSub}>
                {userData.nb_jours_entrainement
                  ? `${userData.nb_jours_entrainement} training day${userData.nb_jours_entrainement > 1 ? "s" : ""} / week`
                  : "Training not set"}
              </Text>
            </View>
          </View>

          <View style={styles.goalDivider} />

          {/* Macros row */}
          <View style={styles.goalMacros}>
            <View style={styles.goalMacroItem}>
              <Text style={styles.goalMacroValue}>{totalCalories}</Text>
              <Text style={styles.goalMacroLabel}>kcal / day</Text>
            </View>
            <View style={styles.goalMacroSep} />
            <View style={styles.goalMacroItem}>
              <Text style={styles.goalMacroValue}>
                {userData.poids_kg || "—"} kg
              </Text>
              <Text style={styles.goalMacroLabel}>Current weight</Text>
            </View>
            <View style={styles.goalMacroSep} />
            <View style={styles.goalMacroItem}>
              <Text style={styles.goalMacroValue}>
                {userData.taille_cm || "—"} cm
              </Text>
              <Text style={styles.goalMacroLabel}>Height</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ─── RECETTES PARTAGÉES ─── */}
      {sharedRecipes.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Shared with you</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Community")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={sharedRecipes}
            keyExtractor={(it) => it.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.sharedCard}
                onPress={() =>
                  navigation.navigate("RecipeDetail", { recipe: item.recette })
                }
              >
                <Image
                  source={{ uri: item.recette?.image_url }}
                  style={styles.sharedCardImage}
                />
                <View style={styles.sharedCardOverlay}>
                  <Text style={styles.sharedCardTitle} numberOfLines={2}>
                    {item.recette?.nom_recette}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.senderBubble}
                  onPress={() =>
                    navigation.navigate("FriendProfile", { user: item.sender })
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {item.sender?.path_pp ? (
                    <Image
                      source={{ uri: item.sender.path_pp }}
                      style={styles.senderAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.senderAvatar,
                        {
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#333",
                        },
                      ]}
                    >
                      <Ionicons name="person" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* ─── MENU ─── */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconBox,
                    item.danger && styles.menuIconBoxDanger,
                    item.accent && styles.menuIconBoxAccent,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={19}
                    color={item.danger ? "#FF4D4D" : item.accent ? ACCENT : ACCENT}
                  />
                </View>
                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                  {item.label}
                </Text>
                <View style={{ flex: 1 }} />
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={item.danger ? "#FF4D4D" : "#C4C4C4"}
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
              {idx < menuItems.length - 1 && <View style={styles.menuSep} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* ─── BIEN-ÊTRE & ACCESSIBILITÉ ─── */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Wellbeing & Accessibility</Text>
        <View style={styles.menuCard}>

          {/* Fonctionnalité 1 : Mode Aveugle */}
          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: "rgba(139,92,246,0.12)" }]}>
              <Ionicons name="eye-off-outline" size={19} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Blind Mode</Text>
              <Text style={styles.menuSublabel}>Hides calories & macros</Text>
            </View>
            <Switch
              value={blindMode}
              onValueChange={toggleBlindMode}
              trackColor={{ false: "#2A2A2A", true: ACCENT }}
              thumbColor={blindMode ? "#000" : "#555"}
            />
          </View>

          <View style={styles.menuSep} />

          {/* Fonctionnalité 3 : Bouton Pause */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowPauseModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "rgba(251,191,36,0.12)" }]}>
              <Ionicons name="pause-circle-outline" size={19} color="#FBBF24" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>
                {accountPaused ? "Account paused ⏸" : "Pause account"}
              </Text>
              <Text style={styles.menuSublabel}>For holidays or recovery</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "rgba(251,191,36,0.18)" }]}>
              <Text style={[styles.badgeText, { color: "#FBBF24" }]}>Exp.</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#C4C4C4" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── ZONE DE DANGER RGPD ─── */}
      <View style={[styles.sectionContainer, { marginBottom: 30 }]}>
        <Text style={[styles.sectionTitle, { color: "#FF4D4D" }]}>Danger Zone</Text>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => { setDeleteStep(1); setDeleteConfirmText(""); setShowDeleteModal(true); }}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteBtnText}>Delete my account and data</Text>
        </TouchableOpacity>
        <Text style={styles.deleteHint}>This action is irreversible. All your data will be deleted in accordance with GDPR.</Text>
      </View>
    </ScrollView>

    <DonationModal
      visible={showDonation}
      onClose={() => setShowDonation(false)}
    />

    {/* ─── MODALE PAUSE (Fonctionnalité 3) ─── */}
    <Modal visible={showPauseModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalEmoji}>⏸️</Text>
          <Text style={styles.modalTitle}>Pause account</Text>
          <Text style={styles.modalBody}>
            Your account will be paused. You won't lose your ranking and won't receive reminder notifications.{"\n\n"}You can reactivate your account anytime.
          </Text>
          <View style={styles.modalBadgeRow}>
            <View style={[styles.badge, { backgroundColor: "rgba(251,191,36,0.18)", paddingHorizontal: 12, paddingVertical: 5 }]}>
              <Text style={[styles.badgeText, { color: "#FBBF24", fontSize: 13 }]}>🧪 Experimental feature</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.modalPrimaryBtn}
            onPress={async () => {
              try {
                const api = require("../api/axiosInstance").default;
                await api.put("/users/me/pause", { paused: !accountPaused });
                setAccountPaused(!accountPaused);
                setShowPauseModal(false);
              } catch (e) {
                Alert.alert("Error", "Unable to update account status.");
              }
            }}
          >
            <Text style={styles.modalPrimaryBtnText}>
              {accountPaused ? "Reactivate my account" : "Activate pause"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setShowPauseModal(false)}>
            <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* ─── MODALE SUPPRESSION RGPD (Fonctionnalité 5) ─── */}
    <Modal visible={showDeleteModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {deleteStep === 1 ? (
            <>
              <Text style={styles.modalEmoji}>⚠️</Text>
              <Text style={[styles.modalTitle, { color: "#FF4D4D" }]}>Delete account</Text>
              <Text style={styles.modalBody}>
                This action is <Text style={{ fontWeight: "800" }}>irreversible</Text>. All your data (profile, meals, sessions, recipes) will be permanently deleted in accordance with GDPR (Art. 17).
              </Text>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: "#FF4D4D" }]}
                onPress={() => setDeleteStep(2)}
              >
                <Text style={styles.modalPrimaryBtnText}>I understand, continue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.modalEmoji}>🔐</Text>
              <Text style={[styles.modalTitle, { color: "#FF4D4D" }]}>Final confirmation</Text>
              <Text style={styles.modalBody}>
                To confirm, type <Text style={{ fontWeight: "800", color: "#FF4D4D" }}>DELETE</Text> below:
              </Text>
              <TextInput
                style={styles.deleteInput}
                placeholder="DELETE"
                placeholderTextColor="#555"
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  { backgroundColor: deleteConfirmText.trim().toUpperCase() === "DELETE" ? "#FF4D4D" : "#333" },
                ]}
                onPress={handleDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || deletingAccount}
              >
                {deletingAccount
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.modalPrimaryBtnText}>Permanently delete</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // ─── HEADER (identique dashboard/training/etc.) ───
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
  },
  addButton: {
    backgroundColor: "#000",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── TITRE PAGE ───
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0A0A0A",
    letterSpacing: -0.5,
    paddingHorizontal: 25,
    marginBottom: 20,
  },

  // ─── CARTE IDENTITÉ ───
  identityCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 22,
    marginHorizontal: 25,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    borderColor: ACCENT,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1,
  },
  identityName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  identitySub: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginBottom: 14,
    fontWeight: "500",
  },
  friendsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(163,255,61,0.12)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 14,
  },
  friendsChipText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: "700",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  editBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // ─── STATS ───
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 25,
    marginBottom: 22,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  statCardAccent: {
    backgroundColor: ACCENT,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "500",
    marginTop: 2,
  },

  // ─── SECTIONS ───
  sectionContainer: {
    marginHorizontal: 25,
    marginBottom: 22,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#0A0A0A",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: "600",
  },

  // ─── OBJECTIF ───
  goalCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 22,
    padding: 20,
  },
  goalTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  goalEmojiBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  goalLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  goalSub: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  goalDivider: {
    height: 1,
    backgroundColor: "#1E1E1E",
    marginBottom: 16,
  },
  goalMacros: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalMacroItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  goalMacroValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  goalMacroLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  goalMacroSep: {
    width: 1,
    height: 28,
    backgroundColor: "#1E1E1E",
  },

  // ─── RECETTES PARTAGÉES ───
  sharedCard: {
    width: 180,
    height: 130,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
  },
  sharedCardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  sharedCardOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
    padding: 12,
  },
  sharedCardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  senderBubble: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
  },
  senderAvatar: {
    width: "100%",
    height: "100%",
  },

  // ─── MENU ───
  menuCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 22,
    paddingVertical: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(163,255,61,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconBoxDanger: {
    backgroundColor: "rgba(255,77,77,0.12)",
  },
  menuIconBoxAccent: {
    backgroundColor: "rgba(163,255,61,0.18)",
    borderWidth: 1,
    borderColor: "rgba(163,255,61,0.25)",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  menuLabelDanger: {
    color: "#FF4D4D",
  },
  menuSep: {
    height: 1,
    backgroundColor: "#1A1A1A",
    marginLeft: 70,
    marginRight: 18,
  },
  badge: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "800",
  },
  menuSublabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "400",
    marginTop: 1,
  },

  // ─── ZONE DANGER ───
  deleteBtn: {
    backgroundColor: "#FF4D4D",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteHint: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },

  // ─── MODALES ───
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    alignItems: "center",
  },
  modalEmoji: {
    fontSize: 44,
    marginBottom: 14,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: "center",
  },
  modalBody: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  modalBadgeRow: {
    marginBottom: 20,
  },
  modalPrimaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  modalPrimaryBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
  modalSecondaryBtn: {
    paddingVertical: 10,
  },
  modalSecondaryBtnText: {
    color: TEXT_MUTED,
    fontSize: 15,
    fontWeight: "600",
  },
  deleteInput: {
    width: "100%",
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FF4D4D",
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 2,
  },
});
