// components/diet.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Écran DIET (recettes)
 * - Données fictives locales pour l’instant
 * - Conçu pour passer facilement en mode API plus tard
 * - Images via URL
 */

const LOCALE = 'fr-FR';

const MOCK_MOST_LOVED = [
    {
        id: 'r1',
        title: 'Poulet rôti & légumes',
        kcalPer100: 120,
        image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
        liked: true,
    },
    {
        id: 'r2',
        title: 'Salade César',
        kcalPer100: 95,
        image:
            'https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=1200&auto=format&fit=crop',
        liked: false,
    },
    {
        id: 'r3',
        title: 'Poke bowl saumon',
        kcalPer100: 110,
        image:
            'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
        liked: false,
    },
];

const MOCK_FOR_YOU = [
    {
        id: 'f1',
        title: 'Haricots verts & dinde',
        kcalPer100: 80,
        image:
            'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop',
        liked: false,
    },
    {
        id: 'f2',
        title: 'Pâtes complètes poulet',
        kcalPer100: 130,
        image:
            'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8bbf?q=80&w=1200&auto=format&fit=crop',
        liked: false,
    },
    {
        id: 'f3',
        title: 'Bœuf sauté & riz',
        kcalPer100: 145,
        image:
            'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
        liked: false,
    },
    {
        id: 'f4',
        title: 'Pâtes pesto light',
        kcalPer100: 115,
        image:
            'https://images.unsplash.com/photo-1528838060462-8b5d6a1d6a9a?q=80&w=1200&auto=format&fit=crop',
        liked: true,
    },
];

export default function Diet({ navigation }) {
    const insets = useSafeAreaInsets();

    // ————— ÉTATS
    const [query, setQuery] = useState('');
    const [liked, setLiked] = useState(() => {
        // petit “store” local de likes (pourrait devenir AsyncStorage ou API)
        const ids = [...MOCK_MOST_LOVED, ...MOCK_FOR_YOU]
            .filter((r) => r.liked)
            .map((r) => r.id);
        return new Set(ids);
    });
    const [loading, setLoading] = useState(false);

    // ————— HOOK API FUTURE (placeholder)
    // Remplace ce useEffect par un vrai fetch quand l’API sera prête.
    // On garde loading pour montrer la structure “réaliste”.
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        const t = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 350);
        return () => {
            mounted = false;
            clearTimeout(t);
        };
    }, []);

    // ————— DONNÉES AFFICHÉES (filtrage par recherche)
    const mostLoved = useMemo(() => {
        const base = MOCK_MOST_LOVED.map((r) => ({ ...r, liked: liked.has(r.id) }));
        if (!query.trim()) return base;
        const q = query.toLowerCase();
        return base.filter((r) => r.title.toLowerCase().includes(q));
    }, [query, liked]);

    const forYou = useMemo(() => {
        const base = MOCK_FOR_YOU.map((r) => ({ ...r, liked: liked.has(r.id) }));
        if (!query.trim()) return base;
        const q = query.toLowerCase();
        return base.filter((r) => r.title.toLowerCase().includes(q));
    }, [query, liked]);

    // ————— ACTIONS
    const toggleLike = (id) => {
        setLiked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const onOpenRecipe = (recipe) => {
        // plus tard: navigation vers “RecipeDetail”
        // navigation.navigate('RecipeDetail', { id: recipe.id })
        Alert.alert('Recette', `Ouvrir la recette: ${recipe.title}`);
        navigation.navigate('RecipeDetail', { recipe });
    };

    const onAdd = () => {
        Alert.alert('Créer une recette', "On fera un formulaire d'ajout plus tard.");
    };

    // ————— COMPOSANTS
    const HeartBtn = ({ active, onPress, size = 22 }) => (
        <Pressable
            onPress={onPress}
            hitSlop={10}
            style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.35)',
            }}
        >
            <Ionicons name={active ? 'heart' : 'heart-outline'} size={size} color="#fff" />
        </Pressable>
    );

    const LargeRecipeCard = ({ item, onPress, onToggleLike }) => (
        <Pressable
            onPress={onPress}
            style={{
                width: 220,
                height: 150,
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: '#111',
                marginRight: 14,
            }}
        >
            <Image
                source={{ uri: item.image }}
                style={{ width: '100%', height: '100%', position: 'absolute' }}
            />
            {/* Overlay sombre */}
            <View
                style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(0,0,0,0.28)',
                }}
            />
            <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'flex-end' }}>
                    <HeartBtn active={item.liked} onPress={onToggleLike} />
                </View>
                <View>
                    <Text
                        numberOfLines={1}
                        style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 }}
                    >
                        {item.title}
                    </Text>
                    <Text style={{ color: '#E5E7EB', fontSize: 12 }}>
                        {item.kcalPer100} kcal per 100g
                    </Text>
                </View>
            </View>
        </Pressable>
    );

    const SmallRecipeCard = ({ item, onPress, onToggleLike }) => (
        <Pressable
            onPress={onPress}
            style={{
                flex: 1,
                height: 210,
                borderRadius: 16,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#EEE',
                marginRight: 10,
                marginBottom: 12,
                overflow: 'hidden',
            }}
        >
            <View style={{ height: 120, backgroundColor: '#F3F4F6' }}>
                <Image
                    source={{ uri: item.image }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
                <View style={{ position: 'absolute', top: 8, right: 8 }}>
                    <HeartBtn active={item.liked} onPress={onToggleLike} />
                </View>
            </View>
            <View style={{ padding: 12 }}>
                <Text numberOfLines={2} style={{ fontWeight: '700' }}>
                    {item.title}
                </Text>
                <Text style={{ marginTop: 4, color: '#6B7280', fontSize: 12 }}>
                    {item.kcalPer100} kcal per 100g
                </Text>
            </View>
        </Pressable>
    );

    // ————— RENDU
    return (
        <View style={{ flex: 1, backgroundColor: '#F5F5F7', paddingTop: insets.top + 16 }}>
            {/* Barre de recherche + Bouton + */}
            <View style={{ paddingHorizontal: 20, marginBottom: 16, flexDirection: 'row', gap: 10 }}>
                <View
                    style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: '#111',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12,
                    }}
                >
                    <Ionicons name="search" size={20} color="#fff" />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search for a recipe"
                        placeholderTextColor="#D1D5DB"
                        style={{
                            flex: 1,
                            color: '#fff',
                            marginLeft: 8,
                            paddingVertical: 8,
                        }}
                    />
                </View>

                <Pressable
                    onPress={onAdd}
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: '#111',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="add" size={26} color="#fff" />
                </Pressable>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                    {/* SECTION: Most loved */}
                    <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                        <Text style={{ fontSize: 20, fontWeight: '800' }}>Most loved</Text>
                    </View>

                    <FlatList
                        data={mostLoved}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                        renderItem={({ item }) => (
                            <LargeRecipeCard
                                item={item}
                                onPress={() => onOpenRecipe(item)}
                                onToggleLike={() => toggleLike(item.id)}
                            />
                        )}
                    />

                    {/* SECTION: For you */}
                    <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 6 }}>
                        <Text style={{ fontSize: 20, fontWeight: '800' }}>For you</Text>
                        <Text style={{ color: '#6B7280', marginTop: 2, fontSize: 12 }}>
                            Special weight loss recipes
                        </Text>
                    </View>

                    <View style={{ paddingHorizontal: 20 }}>
                        <FlatList
                            data={forYou}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            scrollEnabled={false}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
                            renderItem={({ item }) => (
                                <SmallRecipeCard
                                    item={item}
                                    onPress={() => onOpenRecipe(item)}
                                    onToggleLike={() => toggleLike(item.id)}
                                />
                            )}
                            ListEmptyComponent={
                                <View style={{ paddingVertical: 30, alignItems: 'center', opacity: 0.7 }}>
                                    <Ionicons name="leaf-outline" size={28} />
                                    <Text style={{ marginTop: 8, color: '#6B7280' }}>
                                        Aucune recette ne correspond à ta recherche
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

// petite astuce RN sans import direct
const StyleSheet = {
    absoluteFillObject: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
};
