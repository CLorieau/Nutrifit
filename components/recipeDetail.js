// components/recipeDetail.js
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

    // Parse ingredients safely
    const ingredients = useMemo(() => {
        if (!recipe?.ingredients) return [];
        try {
            // Check if it's already an object (if passed pre-parsed) or a string
            return typeof recipe.ingredients === 'string'
                ? JSON.parse(recipe.ingredients)
                : recipe.ingredients;
        } catch (error) {
            console.error('Error parsing ingredients:', error);
            return [];
        }
    }, [recipe?.ingredients]);

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

                    {ingredients.length === 0 ? (
                        <Text style={{ fontStyle: 'italic', color: '#666' }}>
                            Pas d'ingrédients listés.
                        </Text>
                    ) : (
                        <View style={{ marginTop: 4 }}>
                            {ingredients.map((ing, index) => (
                                <View
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'flex-start',
                                        paddingVertical: 12,
                                        borderBottomWidth: index === ingredients.length - 1 ? 0 : 1,
                                        borderBottomColor: '#E5E7EB',
                                    }}
                                >
                                    {/* Bullet point */}
                                    <View
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: '#111',
                                            marginTop: 8,
                                            marginRight: 12,
                                        }}
                                    />
                                    {/* Content */}
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontWeight: '600',
                                                color: '#111',
                                                marginBottom: 2,
                                            }}
                                        >
                                            {ing.food ? ing.food.charAt(0).toUpperCase() + ing.food.slice(1) : 'Ingrédient'}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: '#666',
                                                lineHeight: 20,
                                            }}
                                        >
                                            {ing.text}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
