import React, { useState, useRef, useEffect } from 'react';
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
    Keyboard,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../ChatContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as chatAPI from '../api/chat';

export default function ChatModal() {
    const { isChatOpen, closeChat } = useChat();
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I am your NutriFit assistant. How can I help you today?", sender: 'bot' }
    ]);
    const flatListRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;

        const userMsgText = message;
        const newMsg = { id: Date.now(), text: userMsgText, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        setMessage('');
        setIsLoading(true);

        try {
            // Importation dynamique ou via import en haut si possible, mais ici on garde la structure
            // Note: Idéalement, importer { chatWithBot } from '../api/chat' en haut du fichier.
            // Je vais supposer que l'import sera ajouté en haut.

            const response = await chatAPI.chatWithBot(userMsgText);

            const botMsg = {
                id: Date.now() + 1,
                text: response.response,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            const errorMsg = {
                id: Date.now() + 1,
                text: "Sorry, I am having a connection problem right now.",
                sender: 'bot',
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isChatOpen}
            onRequestClose={closeChat}
        >
            <View style={styles.overlay}>
                {/* Arrière-plan invisible pour fermer le chat en cliquant dehors */}
                <TouchableWithoutFeedback onPress={closeChat}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.modalContainer, { marginTop: insets.top + 20, marginBottom: insets.bottom + 20 }]}
                    onStartShouldSetResponder={() => true} // Empêche le clic de passer à travers vers l'arrière-plan
                >
                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#A3FF3D" />
                            <Text style={styles.headerTitle}>NutriFit Assistant</Text>
                        </View>
                        <TouchableOpacity onPress={closeChat} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* MESSAGES */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id.toString()}
                        style={styles.messagesContainer}
                        contentContainerStyle={{ padding: 16, gap: 12 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item: msg }) => (
                            <View
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
                        )}
                    />

                    {/* INPUT */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask your question..."
                            placeholderTextColor="#666"
                            value={message}
                            onChangeText={setMessage}
                        />
                        <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <Ionicons name="send" size={20} color="#000" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
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
