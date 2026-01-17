import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../ChatContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatModal() {
    const { isChatOpen, closeChat } = useChat();
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Salut ! Je suis ton assistant NutriFit. Comment puis-je t'aider aujourd'hui ?", sender: 'bot' }
    ]);

    const sendMessage = () => {
        if (!message.trim()) return;

        const newMsg = { id: Date.now(), text: message, sender: 'user' };
        setMessages([...messages, newMsg]);
        setMessage('');

        // Simulation réponse bot
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "C'est noté ! Cette fonctionnalité est en cours de développement côté backend.",
                sender: 'bot'
            }]);
        }, 1000);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isChatOpen}
            onRequestClose={closeChat}
        >
            <TouchableWithoutFeedback onPress={closeChat}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={[styles.modalContainer, { marginTop: insets.top + 20, marginBottom: insets.bottom + 20 }]}
                        >
                            {/* HEADER */}
                            <View style={styles.header}>
                                <View style={styles.headerContent}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#A3FF3D" />
                                    <Text style={styles.headerTitle}>Assistant NutriFit</Text>
                                </View>
                                <TouchableOpacity onPress={closeChat} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* MESSAGES */}
                            <View style={styles.messagesContainer}>
                                {messages.map((msg) => (
                                    <View
                                        key={msg.id}
                                        style={[
                                            styles.messageBubble,
                                            msg.sender === 'user' ? styles.userBubble : styles.botBubble
                                        ]}
                                    >
                                        <Text style={[
                                            styles.messageText,
                                            msg.sender === 'user' ? styles.userText : styles.botText
                                        ]}>{msg.text}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* INPUT */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Posez votre question..."
                                    placeholderTextColor="#666"
                                    value={message}
                                    onChangeText={setMessage}
                                />
                                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                                    <Ionicons name="send" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 10,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        backgroundColor: '#000',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
        gap: 12,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#333',
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#A3FF3D',
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    botText: {
        color: '#fff',
    },
    userText: {
        color: '#000',
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
        backgroundColor: '#000',
        alignItems: 'center',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#fff',
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#A3FF3D',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
