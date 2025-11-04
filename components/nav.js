// components/nav.js
import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function Screen({ title }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F7' }}>
            <Text style={{ fontSize: 18 }}>{title}</Text>
        </View>
    );
}

const Dashboard = () => <Screen title="Dashboard" />;
const Calendar  = () => <Screen title="Calendar" />;
const Training  = () => <Screen title="Training" />;
const Diet      = () => <Screen title="Diet" />;
const Profile   = () => <Screen title="Profile" />;

/* --------- Custom Tab Bar --------- */
function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            edges={['bottom']}
            style={{ backgroundColor: '#F5F5F7' }}
        >
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
                                // ⬅️ l’onglet actif s’élargit pour donner de la place au label
                                flex: isFocused ? 1.6 : 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginHorizontal: isFocused ? 10 : 6,
                                overflow: 'visible',
                            }}
                        >
                            {/* Pilule (label) de l’onglet actif */}
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
                                        // ⬇️ pas de troncature : on ajuste la taille si nécessaire
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        minimumFontScale={0.8}
                                    >
                                        {label}
                                    </Text>
                                </View>
                            )}

                            {/* Icône + halo actif */}
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


export default function Nav() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                initialRouteName="Dashboard"
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                }}
                sceneContainerStyle={{ backgroundColor: '#F5F5F7' }} // fond de scène clair
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
                    component={Calendar}
                    options={{
                        tabBarIcon: ({ size }) => <Ionicons name="calendar-outline" size={size} />,
                        tabBarLabel: 'Calendar',
                    }}
                />
                <Tab.Screen
                    name="Training"
                    component={Training}
                    options={{
                        tabBarIcon: ({ size }) => <MaterialCommunityIcons name="dumbbell" size={size} />,
                        tabBarLabel: 'Training',
                    }}
                />
                <Tab.Screen
                    name="Diet"
                    component={Diet}
                    options={{
                        tabBarIcon: ({ size }) => <MaterialCommunityIcons name="silverware-fork-knife" size={size} />,
                        tabBarLabel: 'Diet',
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={Profile}
                    options={{
                        tabBarIcon: ({ size }) => <Ionicons name="person-outline" size={size} />,
                        tabBarLabel: 'Profile',
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
