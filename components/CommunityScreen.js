// components/CommunityScreen.js
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getFriends,
  getPendingRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend
} from "../api/social";

const TABS = ["Mes Amis", "Demandes", "Rechercher"];
const HAS_PENDING_REQUESTS_MOCK = true; // Permet de forcer l'affichage de la pastille

// ─── CARTE UTILISATEUR ────────────────────────────────────────────────────────
function UserCard({ user, onAction, actionType, onCardPress }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction(user);
    } finally {
      setLoading(false);
    }
  };

  const CardWrapper = onCardPress ? TouchableOpacity : View;

  return (
    <CardWrapper 
      style={styles.card} 
      activeOpacity={0.7} 
      onPress={onCardPress ? () => onCardPress(user) : undefined}
    >
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
        {user.statusText && (
          <Text style={styles.statusText} numberOfLines={1}>
             {user.statusIcon} {user.statusText}
          </Text>
        )}
      </View>
      
      {/* Dynamic Actions based on tab */}
      {actionType === 'FRIEND' && (
         <TouchableOpacity style={styles.actionBtnOutline} onPress={handleAction} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.actionBtnTextOutline}>Retirer</Text>}
         </TouchableOpacity>
      )}

      {actionType === 'REQUEST' && (
         <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={() => onAction(user, 'REJECT')} disabled={loading}>
              <Text style={styles.actionBtnTextOutline}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => onAction(user, 'ACCEPT')} disabled={loading}>
              <Text style={styles.actionBtnTextPrimary}>Accepter</Text>
            </TouchableOpacity>
         </View>
      )}

      {actionType === 'SEARCH' && (
         <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleAction} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.actionBtnTextPrimary}>Ajouter</Text>}
         </TouchableOpacity>
      )}

      {onCardPress && (
         <Ionicons name="chevron-forward" size={18} color="#555" style={{ marginLeft: 8 }} />
      )}
    </CardWrapper>
  );
}

// ─── ECRAN COMMUNAUTE ────────────────────────────────────────────────────────
export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(0);

  // -- Données
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  
  // -- Loadings
  const [listLoading, setListLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setListLoading(true);
    try {
       const [friendsRes, requestsRes] = await Promise.all([getFriends(), getPendingRequests()]);
       setFriends(friendsRes.data || []);
       setRequests(requestsRes.data || []);
    } catch(e) {
       console.log("Erreur", e);
    } finally {
       setListLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // -- Mes amis action
  const handleRemoveFriend = async (user) => {
    Alert.alert("Retirer l'ami", `Voulez-vous vraiment retirer ${user.prenom} de vos amis ?`, [
        { text: "Annuler", style: "cancel" },
        { text: "Retirer", style: "destructive", onPress: async () => {
             await removeFriend(user.id_utilisateur);
             setFriends(prev => prev.filter(u => u.id_utilisateur !== user.id_utilisateur));
        }}
    ])
  };

  // -- Demandes actions
  const handleRequestAction = async (user, type) => {
      if(type === 'ACCEPT') {
         await acceptFriendRequest(user.id_utilisateur);
         setFriends(prev => [...prev, user]);
         setRequests(prev => prev.filter(u => u.id_utilisateur !== user.id_utilisateur));
      } else {
         await rejectFriendRequest(user.id_utilisateur);
         setRequests(prev => prev.filter(u => u.id_utilisateur !== user.id_utilisateur));
      }
  };

  // -- Search actions
  const handleSearch = async (text) => {
    setSearchQuery(text);
    if(text.trim().length < 2) {
       setSearchResults([]);
       return;
    }
    setSearchLoading(true);
    try {
       const res = await searchUsers(text);
       setSearchResults(res.data);
    } finally {
       setSearchLoading(false);
    }
  };

  const handleAddFriend = async (user) => {
      await sendFriendRequest(user.id_utilisateur);
      Alert.alert("Succès", `Demande d'ami envoyée à ${user.prenom}`);
      setSearchResults(prev => prev.filter(u => u.id_utilisateur !== user.id_utilisateur));
  };


  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
           <Ionicons name="chevron-back" size={28} color="#0A0A0A" />
        </TouchableOpacity>
        <Text style={styles.title}>Communauté</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab, idx) => {
          const isDemandes = idx === 1;
          const showBadge = isDemandes && HAS_PENDING_REQUESTS_MOCK;
          
          return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>
                {tab}
                </Text>
                {showBadge && (
                    <View style={styles.notificationBadge} />
                )}
            </View>
          </TouchableOpacity>
        )})}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {/* TAB 0 - Mes amis */}
        {activeTab === 0 && (
            listLoading ? <ActivityIndicator size="large" color="#A3FF3D" style={{marginTop:40}}/> :
            <FlatList 
               data={friends}
               renderItem={({item}) => (
                  <UserCard 
                    user={item} 
                    onAction={handleRemoveFriend} 
                    actionType="FRIEND" 
                    onCardPress={(u) => navigation.navigate("FriendProfile", { user: u })} 
                  />
               )}
               keyExtractor={(item) => String(item.id_utilisateur)}
               ListEmptyComponent={<Text style={styles.emptyText}>Vous n'avez pas encore d'amis.</Text>}
            />
        )}

        {/* TAB 1 - Demandes */}
        {activeTab === 1 && (
            listLoading ? <ActivityIndicator size="large" color="#A3FF3D" style={{marginTop:40}}/> :
            <FlatList 
               data={requests}
               renderItem={({item}) => <UserCard user={item} onAction={handleRequestAction} actionType="REQUEST" />}
               keyExtractor={(item) => String(item.id_utilisateur)}
               ListEmptyComponent={<Text style={styles.emptyText}>Aucune demande d'ami en attente.</Text>}
            />
        )}

        {/* TAB 2 - Recherche */}
        {activeTab === 2 && (
           <View style={{ flex: 1 }}>
               <View style={styles.searchBar}>
                   <Ionicons name="search-outline" size={18} color="#888" style={{ marginRight: 8 }} />
                   <TextInput
                     style={styles.searchInput}
                     placeholder="Rechercher par nom…"
                     placeholderTextColor="#888"
                     value={searchQuery}
                     onChangeText={handleSearch}
                     autoCapitalize="none"
                   />
               </View>
               
               {searchLoading && <ActivityIndicator color="#A3FF3D" style={{marginTop: 20}} />}
               
               {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                   <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
               )}

               <FlatList 
                  data={searchResults}
                  renderItem={({item}) => <UserCard user={item} onAction={handleAddFriend} actionType="SEARCH" />}
                  keyExtractor={(item) => String(item.id_utilisateur)}
               />
           </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  header: {
      flexDirection: 'row', 
      alignItems: 'center',
      marginBottom: 20,
  },
  backButton: {
      marginRight: 12,
  },
  title: { fontSize: 34, fontWeight: "700", color: "#0A0A0A" },
  
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 14,
    padding: 6,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#000" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#A3FF3D", fontWeight: "700" },
  notificationBadge: {
      width: 8, height: 8, borderRadius: 4, 
      backgroundColor: '#A3FF3D',
      marginLeft: 5,
      marginTop: -8,
  },

  searchBar: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F7",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16
  },
  searchInput: { flex: 1, fontSize: 15, color: "#000" },

  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#000",
    borderRadius: 16, padding: 14, marginBottom: 12,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: "#333",
    alignItems: "center", justifyContent: "center", overflow: "hidden"
  },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  cardInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  cardName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  statusText: { color: "#bbb", fontSize: 13, marginTop: 4 },

  actionBtnPrimary: {
      backgroundColor: '#A3FF3D',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 14,
      minWidth: 80,
      alignItems: 'center',
  },
  actionBtnTextPrimary: { color: '#000', fontWeight: '700', fontSize: 13 },
  
  actionBtnOutline: {
      backgroundColor: 'transparent',
      borderColor: '#555',
      borderWidth: 1,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 14,
      minWidth: 80,
      alignItems: 'center',
  },
  actionBtnTextOutline: { color: '#fff', fontWeight: '600', fontSize: 13 },

  emptyText: { textAlign: "center", color: "#888", marginTop: 40, fontSize: 15 }
});
