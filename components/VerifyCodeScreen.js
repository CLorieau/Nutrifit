// components/VerifyCodeScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    Alert,
    ActivityIndicator,
} from "react-native";

import { verifyCode } from "../api/auth";

export default function VerifyCodeScreen({ route, navigation }) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const email = route?.params?.email;

    const handleVerify = async () => {
        if (!code) {
            Alert.alert("Erreur", "Veuillez saisir le code reçu par e-mail.");
            return;
        }

        if (!email) {
            Alert.alert(
                "Erreur",
                "Email introuvable. Veuillez recommencer l'inscription."
            );
            return;
        }

        if (code.length !== 6) {
            Alert.alert("Erreur", "Le code doit contenir 6 chiffres.");
            return;
        }

        try {
            setLoading(true);

            await verifyCode({
                email: email,
                code: code,
            });

            Alert.alert(
                "Succès",
                "Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("Login"),
                    },
                ]
            );
        } catch (error) {
            console.log("Erreur vérification code :", error?.response?.data || error);

            const status = error?.response?.status;

            if (status === 400) {
                Alert.alert("Erreur", "Code incorrect ou expiré.");
            } else if (status === 404) {
                Alert.alert("Erreur", "Utilisateur introuvable pour cet email.");
            } else {
                Alert.alert(
                    "Erreur",
                    "Impossible de vérifier le code pour le moment. Veuillez réessayer."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require("../assets/welcome_page_pic.jpg")}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>Verify Code</Text>

                {email && (
                    <Text style={styles.subtitle}>
                        Un code a été envoyé à{"\n"}
                        <Text style={{ fontWeight: "bold" }}>{email}</Text>
                    </Text>
                )}

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor="#aaa"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={code}
                        onChangeText={setCode}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify</Text>
                    )}
                </TouchableOpacity>

                <Text
                    style={styles.footer}
                    onPress={() => navigation.navigate("Login")}
                >
                    Retour à la connexion
                </Text>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
    },
    overlay: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        padding: 30,
        borderTopLeftRadius: 100,
        height: "70%",
        marginTop: 230,
    },
    title: {
        fontSize: 28,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        color: "white",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.2)",
        color: "white",
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
        textAlign: "center",
        letterSpacing: 4,
        fontSize: 18,
    },
    button: {
        backgroundColor: "black",
        paddingVertical: 12,
        borderRadius: 80,
        alignItems: "center",
        marginTop: 40,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    footer: {
        color: "#fff",
        textAlign: "center",
        marginTop: 15,
        textDecorationLine: "underline",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 30,
        marginTop: 40,
    },
});
