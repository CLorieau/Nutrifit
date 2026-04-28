// components/SocialScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../api/social";

// ─── Onglets ──────────────────────────────────────────────────────────────────
const TABS = ["Search", "Following", "Followers"];

// ─── Carte utilisateur ────────────────────────────────────────────────────────
function UserCard({ user, onToggleFollow }) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      await onToggleFollow(user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        {user.path_pp ? (
          <Image source={{ uri: user.path_pp }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person" size={26} color="#fff" />
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>
          {user.prenom ? `${user.prenom} ${user.nom}` : user.nom}
        </Text>
      </View>
      {onToggleFollow && (
        <TouchableOpacity
          style={[
            styles.followBtn,
            user.is_followed ? styles.followBtnActive : {},
          ]}
          onPress={handlePress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={user.is_followed ? "#000" : "#fff"} />
          ) : (
            <Text
              style={[
                styles.followBtnText,
                user.is_followed ? styles.followBtnTextActive : {},
              ]}
            >
              {user.is_followed ? "Following ✓" : "Follow"}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Écran principal ─────────────────────────────────────────────────────────
export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  // -- Recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // -- Listes
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // ── Charger listes au focus de l'onglet ──────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [])
  );

  const loadLists = async () => {
    setListLoading(true);
    try {
      const [fw, fb] = await Promise.all([getFollowing(), getFollowers()]);
      setFollowing(fw.data.map((u) => ({ ...u, is_followed: true })));
      setFollowers(fb.data);
    } catch (e) {
      console.error("Erreur chargement social:", e);
    } finally {
      setListLoading(false);
    }
  };

  // ── Recherche ─────────────────────────────────────────────────────────────
  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await searchUsers(text.trim());
      setSearchResults(res.data);
    } catch (e) {
      console.error("Erreur recherche:", e);
    } finally {
      setSearchLoading(false);
    }
  };

  // ── Toggle follow depuis la recherche ─────────────────────────────────────
  const handleToggleFollowSearch = async (user) => {
    try {
      if (user.is_followed) {
        await unfollowUser(user.id_utilisateur);
      } else {
        await followUser(user.id_utilisateur);
      }
      setSearchResults((prev) =>
        prev.map((u) =>
          u.id_utilisateur === user.id_utilisateur
            ? { ...u, is_followed: !u.is_followed }
            : u
        )
      );
      loadLists(); // rafraîchir les onglets
    } catch (e) {
      Alert.alert("Error", "Unable to update follow status.");
    }
  };

  // ── Unfollow depuis l'onglet Abonnements ─────────────────────────────────
  const handleUnfollow = async (user) => {
    Alert.alert(
      "Unfollow",
      `Do you want to stop following ${user.prenom || ""} ${user.nom}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unfollow",
          style: "destructive",
          onPress: async () => {
            try {
              await unfollowUser(user.id_utilisateur);
              setFollowing((prev) =>
                prev.filter((u) => u.id_utilisateur !== user.id_utilisateur)
              );
            } catch {
              Alert.alert("Error", "Unable to unfollow.");
            }
          },
        },
      ]
    );
  };

  // ── Rendu onglet Recherche ─────────────────────────────────────────────────
  const renderSearch = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(""); setSearchResults([]); }}>
            <Ionicons name="close-circle" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {searchLoading && (
        <ActivityIndicator style={{ marginTop: 20 }} color="#A3FF3D" />
      )}

      {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
        <Text style={styles.emptyText}>No user found</Text>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => String(item.id_utilisateur)}
        renderItem={({ item }) => (
          <UserCard user={item} onToggleFollow={handleToggleFollowSearch} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );

  // ── Rendu liste générique ──────────────────────────────────────────────────
  const renderList = (data, onUnfollow) => {
    if (listLoading)
      return <ActivityIndicator style={{ marginTop: 40 }} color="#A3FF3D" />;
    if (data.length === 0)
      return <Text style={styles.emptyText}>No users here</Text>;
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id_utilisateur)}
        renderItem={({ item }) => (
          <UserCard user={item} onToggleFollow={onUnfollow} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        onRefresh={loadLists}
        refreshing={listLoading}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <Text style={styles.title}>Community</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
          >
            <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 0 && renderSearch()}
        {activeTab === 1 && renderList(following, handleUnfollow)}
        {activeTab === 2 && renderList(followers, null)}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 20,
  },

  // ── Tabs ──────────────────────────
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#000",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
  },
  tabTextActive: {
    color: "#A3FF3D",
    fontWeight: "700",
  },

  // ── Search ────────────────────────
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },

  // ── Cards ─────────────────────────
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // ── Follow button ─────────────────
  followBtn: {
    backgroundColor: "#A3FF3D",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 76,
    alignItems: "center",
  },
  followBtnActive: {
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#A3FF3D",
  },
  followBtnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },
  followBtnTextActive: {
    color: "#A3FF3D",
  },

  // ── Empty ─────────────────────────
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 15,
  },
});
