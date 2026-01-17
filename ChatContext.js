import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext({
    isChatOpen: false,
    openChat: () => { },
    closeChat: () => { },
});

export const ChatProvider = ({ children }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const openChat = () => setIsChatOpen(true);
    const closeChat = () => setIsChatOpen(false);

    return (
        <ChatContext.Provider value={{ isChatOpen, openChat, closeChat }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);

export default ChatContext;
