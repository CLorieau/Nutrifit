import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from '../api/profileAPI';

export default function EditProfile() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();

    // Initial data passed from Profile screen
    const { userData } = route.params || {};

    const [form, setForm] = useState({
        nom: '',
        prenom: '',
        age: '',
        poids_kg: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setForm({
                nom: userData.nom || '',
                prenom: userData.prenom || '',
                age: userData.age ? String(userData.age) : '',
                poids_kg: userData.poids_kg ? String(userData.poids_kg) : ''
            });
        }
    }, [userData]);

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Prepare payload
            const payload = {
                nom: form.nom,
                prenom: form.prenom,
                age: form.age ? parseInt(form.age) : undefined,
                poids_kg: form.poids_kg ? parseFloat(form.poids_kg) : undefined
            };

            await updateProfile(payload);

            Alert.alert("Success", "Profile updated", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Update failed", error);
            Alert.alert("Error", "Unable to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit my profile</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First name</Text>
                        <TextInput
                            style={styles.input}
                            value={form.prenom}
                            onChangeText={(t) => handleChange('prenom', t)}
                            placeholder="Your first name"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last name</Text>
                        <TextInput
                            style={styles.input}
                            value={form.nom}
                            onChangeText={(t) => handleChange('nom', t)}
                            placeholder="Your last name"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                value={form.age}
                                onChangeText={(t) => handleChange('age', t)}
                                keyboardType="numeric"
                                placeholder="Age"
                                placeholderTextColor="#666"
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                value={form.poids_kg}
                                onChangeText={(t) => handleChange('poids_kg', t)}
                                keyboardType="numeric"
                                placeholder="Weight"
                                placeholderTextColor="#666"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#000',
        paddingTop: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F5F5F7',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#000',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: '#A3FF3D',
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 30,
        shadowColor: '#A3FF3D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    }
});
