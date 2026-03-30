import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFriendProfile, getSharedRecipes } from '../api/social';

export default function FriendProfileScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = route.params || {};

    const [profile, setProfile] = React.useState(null);
    const [sharedWithMe, setSharedWithMe] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (user && user.id_utilisateur) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [profRes, sharedRes] = await Promise.all([
                        getFriendProfile(user.id_utilisateur),
                        getSharedRecipes()
                    ]);
                    setProfile(profRes.data);
                    
                    const allShared = sharedRes.data || [];
                    const fromThisFriend = allShared.filter(it => it.sender_id === user.id_utilisateur || it.sender?.id_utilisateur === user.id_utilisateur);
                    setSharedWithMe(fromThisFriend);
                } catch (error) {
                    console.error("Error fetching friend profile:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    if (!user) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Utilisateur introuvable.</Text>
            </View>
        );
    }

    const age = profile?.age || 25;
    const objectif = profile?.objectif || 'Rester en forme';
    const recipes = profile?.recettes_favorites || [];
    const programs = profile?.programmes_actifs || [];

    const renderRecipeItem = ({ item }) => (
        <View style={styles.recipeCard}>
            <Image source={{ uri: item.image_url || item.image }} style={styles.recipeImage} />
            <Text style={styles.recipeTitle} numberOfLines={1}>{item.nom_recette || item.title}</Text>
            <TouchableOpacity 
                style={styles.recipeBtn}
                onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
            >
                <Text style={styles.recipeBtnText}>Voir la recette</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView 
            style={[styles.container, { paddingTop: insets.top + 16 }]} 
            contentContainerStyle={{ paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#0A0A0A" />
                </TouchableOpacity>
                <Text style={styles.title}>Profil de {user.prenom || user.nom}</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Profile Main Card */}
            <View style={styles.profileCard}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        {user.path_pp ? (
                            <Image source={{ uri: user.path_pp }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons name="person" size={30} color="#fff" />
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                            {user.prenom ? `${user.prenom} ${user.nom}` : user.nom}
                        </Text>
                        <Text style={styles.profileMeta}>
                            {age} yo | {objectif}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.friendIndicatorBtn}>
                        <Text style={styles.friendIndicatorText}>Ami <Ionicons name="checkmark" size={13} color="#000" /></Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Section: Objectifs Safe */}
            <Text style={styles.sectionTitle}>Objectifs en cours</Text>
            <View style={styles.cardBox}>
                <View style={styles.goalRow}>
                    <Progress.Circle
                        size={56}
                        progress={0.7}
                        color="#A3FF3D"
                        unfilledColor="#222"
                        borderWidth={0}
                        thickness={5}
                    />
                    <View style={styles.goalInfo}>
                        <Text style={styles.goalTitle}>Régularité des séances</Text>
                        <Text style={styles.goalSubtitle}>Très constant cette semaine !</Text>
                    </View>
                </View>
            </View>

            {/* Section: Recettes Favorites (Carousel) */}
            <Text style={styles.sectionTitle}>Recettes Favorites</Text>
            {recipes.length > 0 ? (
                <FlatList
                    horizontal
                    data={recipes}
                    keyExtractor={(it) => it.id_recette?.toString() || it.id?.toString() || Math.random().toString()}
                    renderItem={renderRecipeItem}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 20, paddingRight: 10, paddingBottom: 20 }}
                />
            ) : (
                <Text style={styles.emptyText}>{user.prenom || user.nom} n'a aucune recette favorite.</Text>
            )}

            {/* Section: Partagées avec vous */}
            <Text style={styles.sectionTitle}>Partagées avec vous</Text>
            {sharedWithMe.length > 0 ? (
                <FlatList
                    horizontal
                    data={sharedWithMe}
                    keyExtractor={(it) => it.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 20, paddingRight: 10, paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.recipeCard}>
                            <Image source={{ uri: item.recette?.image_url }} style={styles.recipeImage} />
                            <Text style={styles.recipeTitle} numberOfLines={1}>{item.recette?.nom_recette}</Text>
                            <TouchableOpacity 
                                style={styles.recipeBtn}
                                onPress={() => navigation.navigate('RecipeDetail', { recipe: item.recette })}
                            >
                                <Text style={styles.recipeBtnText}>Voir la recette</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>{user.prenom || user.nom} ne vous a partagé aucune recette.</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    
    // Header
    header: {
        flexDirection: 'row', 
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    backButton: { },
    title: { fontSize: 24, fontWeight: "700", color: "#0A0A0A" },
    
    // Profile Card
    profileCard: {
        backgroundColor: '#000',
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 30,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: "#333",
        alignItems: "center", justifyContent: "center", overflow: "hidden"
    },
    avatarImage: { width: 64, height: 64, borderRadius: 32 },
    profileInfo: { flex: 1, marginLeft: 16 },
    profileName: { color: "#fff", fontSize: 20, fontWeight: "700" },
    profileMeta: { color: "#bbb", fontSize: 14, marginTop: 4 },
    friendIndicatorBtn: {
        backgroundColor: '#A3FF3D',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    friendIndicatorText: { color: '#000', fontWeight: '700', fontSize: 13 },

    // Sections
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
        marginHorizontal: 20,
        marginBottom: 12,
        marginTop: 10,
    },
    cardBox: {
        backgroundColor: "#000",
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 30,
    },
    goalRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    goalInfo: {
        marginLeft: 16,
        flex: 1,
    },
    goalTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    goalSubtitle: {
        color: "#bbb",
        fontSize: 13,
        marginTop: 4,
    },

    // Horizontal Recettes
    recipeCard: {
        width: 160,
        marginRight: 16,
        backgroundColor: '#000',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    recipeImage: {
        width: 136,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#333'
    },
    recipeTitle: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 10,
        textAlign: 'center'
    },
    recipeBtn: {
        marginTop: 10,
        backgroundColor: '#A3FF3D',
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 12,
        width: '100%',
        alignItems: 'center'
    },
    recipeBtnText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 12,
    },

    emptyText: {
        color: '#888',
        marginLeft: 20,
        marginBottom: 30,
        fontSize: 14,
    }
});
