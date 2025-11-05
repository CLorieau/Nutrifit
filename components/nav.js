// components/nav.js
import React from 'react';
import { View, Text, TouchableOpacity }     from 'react-native';
import { NavigationContainer }              from '@react-navigation/native';
import { createBottomTabNavigator }         from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator }       from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets }  from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import CalendarView         from "../screens/calendarview";
import ProfileView          from "../screens/profileview";
import DietView             from "../screens/dietview";
import RecipeDetailView     from "../screens/recipeDetailView";
import TrainingView         from "../screens/trainingview";
import TrainingDetailView   from "../screens/trainingDetailView"

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Screen({ title }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F7' }}>
            <Text style={{ fontSize: 18 }}>{title}</Text>
        </View>
    );
}

const Dashboard = () => <Screen title="Dashboard" />;

/* --------- Custom Tab Bar --------- */
function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#F5F5F7' }}>
            <View
                style={{
                    marginHorizontal: 20,
                    marginBottom: (insets.bottom || 10),
                    borderRadius: 28,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E6E6E8',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 12,
                    height: 72,
                    overflow: 'visible',
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 6,
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

                    const icon = options.tabBarIcon
                        ? options.tabBarIcon({ focused: isFocused, size: 26 })
                        : null;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            activeOpacity={0.9}
                            style={{
                                flex: isFocused ? 1.6 : 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginHorizontal: isFocused ? 10 : 6,
                                overflow: 'visible',
                            }}
                        >
                            {isFocused && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: -34,
                                        paddingHorizontal: 18,
                                        height: 30,
                                        borderRadius: 18,
                                        backgroundColor: '#222',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 5,
                                        shadowColor: '#000',
                                        shadowOpacity: 0.15,
                                        shadowRadius: 6,
                                        shadowOffset: { width: 0, height: 2 },
                                        elevation: 4,
                                        alignSelf: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontWeight: '600',
                                            fontSize: 14,
                                            textAlign: 'center',
                                        }}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        minimumFontScale={0.8}
                                    >
                                        {label}
                                    </Text>
                                </View>
                            )}

                            <View
                                style={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: 27,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transform: [{ translateY: isFocused ? -4 : 0 }],
                                    backgroundColor: isFocused ? '#fff' : 'transparent',
                                    borderWidth: isFocused ? 1 : 0,
                                    borderColor: isFocused ? '#222' : 'transparent',
                                }}
                            >
                                {icon}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
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
        </Stack.Navigator>
    );
}

export default function Nav() {
    return (
        <NavigationContainer>
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
                    component={Dashboard}
                    options={{
                        tabBarIcon: ({ size }) => <Ionicons name="grid-outline" size={size} />,
                        tabBarLabel: 'Dashboard',
                    }}
                />
                <Tab.Screen
                    name="Calendar"
                    component={CalendarView}
                    options={{
                        tabBarIcon: ({ size }) => <Ionicons name="calendar-outline" size={size} />,
                        tabBarLabel: 'Calendar',
                    }}
                />
                <Tab.Screen
                    name="Training"
                    component={TrainingStack} 
                    options={{
                        tabBarIcon: ({ size }) => (<MaterialCommunityIcons name="dumbbell" size={size} />),
                        tabBarLabel: 'Training',
                    }}
                />
                {/* ✅ Utiliser UNIQUEMENT la stack pour Diet */}
                <Tab.Screen
                    name="Diet"
                    component={DietStack}
                    options={{
                        tabBarIcon: ({ size }) => (
                            <MaterialCommunityIcons name="silverware-fork-knife" size={size} />
                        ),
                        tabBarLabel: 'Diet',
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileView}
                    options={{
                        tabBarIcon: ({ size }) => <Ionicons name="person-outline" size={size} />,
                        tabBarLabel: 'Profile',
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
