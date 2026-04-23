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

  const [loading, setLoading] = React.useState(true);
  const [friendsCount, setFriendsCount] = React.useState(0);
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

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
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
      badge: friendsCount > 0 ? String(friendsCount) : null,
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

                <Text
                  style={[
                    styles.menuLabel,
                    item.danger && styles.menuLabelDanger,
                  ]}
                >
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
    </ScrollView>

    <DonationModal
      visible={showDonation}
      onClose={() => setShowDonation(false)}
    />
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
});
