// components/nav.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getPendingRequests } from '../api/social';

import CalendarView from "../screens/calendarview";
import ProfileView from "../screens/profileview";
import DietView from "../screens/dietview";
import RecipeDetailView from "../screens/recipeDetailView";
import TrainingView from "../screens/trainingview";
import TrainingDetailView from "../screens/trainingDetailView";
import ActiveWorkout from "./activeWorkout";
import DashboardView from "../screens/dashboardView";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Screen({ title }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F7' }}>
            <Text style={{ fontSize: 18 }}>{title}</Text>
        </View>
    );
}

//Custom Tab Bar 
function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'transparent', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <View
                style={{
                    marginHorizontal: 20,
                    marginBottom: (insets.bottom || 10),
                    borderRadius: 36,
                    backgroundColor: '#000000',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 8,
                    height: 70,
                }}
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel ?? options.title ?? route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const iconColor = isFocused ? '#A3FF3D' : '#A1A1AA';
                    const icon = options.tabBarIcon
                        ? options.tabBarIcon({ focused: isFocused, size: 26, color: iconColor })
                        : null;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            activeOpacity={0.8}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <View
                                style={{
                                    width: 50,
                                    height: 50,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {/* Fond actif séparé pour éviter la perte de borderRadius sur Android */}
                                {isFocused && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            width: 50,
                                            height: 50,
                                            borderRadius: 25,
                                            backgroundColor: '#1E1E1E',
                                        }}
                                    />
                                )}
                                {icon}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

/* --------- Dashboard stack (Dashboard + détails) --------- */
function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardHome" component={DashboardView} />
            <Stack.Screen name="TrainingDetail" component={TrainingDetailView} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailView} />
        </Stack.Navigator>
    );
}


/* --------- Diet stack (Home + Detail) --------- */
function DietStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DietHome" component={DietView} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailView} />
        </Stack.Navigator>
    );
}

/* --------- Training stack (Home + Detail) --------- */
function TrainingStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TrainingHome" component={TrainingView} />
            <Stack.Screen name="TrainingDetail" component={TrainingDetailView} />
            <Stack.Screen name="ActiveWorkout" component={ActiveWorkout} />
        </Stack.Navigator>
    );
}

import EditProfileView from "../screens/EditProfileView";

/* --------- Profile stack (Home + Edit) --------- */
function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileHome" component={ProfileView} />
            <Stack.Screen name="EditProfile" component={EditProfileView} />
        </Stack.Navigator>
    );
}

export default function Nav() {
    const [hasPendingRequests, setHasPendingRequests] = useState(false);

    useEffect(() => {
        const checkRequests = async () => {
            try {
                const res = await getPendingRequests();
                setHasPendingRequests(res.data && res.data.length > 0);
            } catch (e) {
                // ignore
            }
        };
        checkRequests();
        const interval = setInterval(checkRequests, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
            }}
            sceneContainerStyle={{ backgroundColor: '#F5F5F7' }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardStack}
                options={{
                    tabBarIcon: ({ size, color }) => <Ionicons name="grid" size={size} color={color} />,
                    tabBarLabel: 'Dashboard',
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarView}
                options={{
                    tabBarIcon: ({ size, color }) => <Ionicons name="calendar" size={size} color={color} />,
                    tabBarLabel: 'Calendar',
                }}
            />
            <Tab.Screen
                name="Training"
                component={TrainingStack}
                options={{
                    tabBarIcon: ({ size, color }) => (<MaterialCommunityIcons name="dumbbell" size={size} color={color} />),
                    tabBarLabel: 'Training',
                }}
            />
            <Tab.Screen
                name="Diet"
                component={DietStack}
                options={{
                    tabBarIcon: ({ size, color }) => <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />,
                    tabBarLabel: 'Diet',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    tabBarIcon: ({ size, color }) => {
                        return (
                            <View style={{ position: "relative" }}>
                                <Ionicons name="person" size={size} color={color} />
                                {hasPendingRequests && (
                                    <View
                                        style={{
                                            position: "absolute",
                                            top: -2,
                                            right: -4,
                                            width: 12,
                                            height: 12,
                                            borderRadius: 6,
                                            backgroundColor: "#A3FF3D", // Vert fluo Nutrifit
                                            borderWidth: 2,
                                            borderColor: "#fff" // Pour le faire ressortir
                                        }}
                                    />
                                )}
                            </View>
                        );
                    },
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
}
