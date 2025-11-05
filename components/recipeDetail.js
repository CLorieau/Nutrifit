// components/recipeDetail.js
import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    Pressable,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Exemple d’ingrédients avec images en ligne
const MOCK_INGREDIENTS = [
    {
        id: 'i1',
        name: 'Pepper',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Bell_pepper_red.jpg',
    },
    {
        id: 'i2',
        name: 'Zucchini',
        image: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Zucchini.jpg',
    },
    {
        id: 'i3',
        name: 'Rice',
        image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Cooked_rice_in_a_bowl.jpg',
    },
    {
        id: 'i4',
        name: 'Minced meat',
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Ground_beef_1.jpg',
    },
    {
        id: 'i5',
        name: 'Tomato',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg',
    },
    {
        id: 'i6',
        name: 'Mushroom',
        image: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/White_button_mushrooms.jpg',
    },
];

export default function RecipeDetail({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { recipe } = route.params || {};

    const [liked, setLiked] = useState(recipe?.liked ?? false);

    const toggleLike = () => {
        setLiked((prev) => !prev);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    if (!recipe) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F5F5F7',
                }}
            >
                <Text>Recette introuvable.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F5F7', paddingTop: insets.top + 8 }}>
            {/* HEADER */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    marginBottom: 8,
                }}
            >
                <Pressable onPress={handleBack} hitSlop={10}>
                    <Ionicons name="chevron-back" size={26} color="#000" />
                </Pressable>
                <Text style={{ fontSize: 18, fontWeight: '600' }} numberOfLines={1}>
                    {recipe.title}
                </Text>
                <Pressable
                    onPress={toggleLike}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons
                        name={liked ? 'heart' : 'heart-outline'}
                        size={24}
                        color={liked ? 'red' : '#000'}
                    />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* IMAGE PRINCIPALE */}
                <View
                    style={{
                        paddingHorizontal: 20,
                        marginBottom: 16,
                    }}
                >
                    <View
                        style={{
                            borderRadius: 16,
                            overflow: 'hidden',
                            backgroundColor: '#E5E7EB',
                        }}
                    >
                        <Image
                            source={{ uri: recipe.image }}
                            style={{ width: '100%', height: 260 }}
                            resizeMode="cover"
                        />
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 16,
                            left: 36,
                            backgroundColor: 'rgba(0,0,0,0.45)',
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                            {recipe.title}
                        </Text>
                        <Text style={{ color: '#E5E7EB', fontSize: 12 }}>
                            {recipe.kcalPer100} kcal per 100g
                        </Text>
                        <Text style={{ color: '#E5E7EB', fontSize: 12 }}>
                            20g protein | 5g fat | 10g carbs
                        </Text>
                    </View>
                </View>

                {/* INGREDIENTS */}
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
                        Ingredients
                    </Text>

                    <View
                        style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'flex-start',
                        }}
                    >
                        {MOCK_INGREDIENTS.map((ing) => (
                            <View
                                key={ing.id}
                                style={{
                                    width: '25%', // 4 éléments par ligne
                                    alignItems: 'center',
                                    marginBottom: 20,
                                }}
                            >
                                <View
                                    style={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: 35,
                                        backgroundColor: '#fff',
                                        borderWidth: 1,
                                        borderColor: '#EEE',
                                        overflow: 'hidden',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image
                                        source={{ uri: ing.image }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: '#111',
                                        textAlign: 'center',
                                        marginTop: 6,
                                    }}
                                >
                                    {ing.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
