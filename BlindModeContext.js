// BlindModeContext.js
// Fonctionnalité 1 : Mode Aveugle — contexte global persistant via AsyncStorage
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "blind_mode_enabled";

const BlindModeContext = createContext({
  blindMode: false,
  toggleBlindMode: () => {},
});

export function BlindModeProvider({ children }) {
  const [blindMode, setBlindMode] = useState(false);

  // Chargement depuis AsyncStorage au démarrage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === "true") setBlindMode(true);
    });
  }, []);

  const toggleBlindMode = async () => {
    const next = !blindMode;
    setBlindMode(next);
    await AsyncStorage.setItem(STORAGE_KEY, next ? "true" : "false");
  };

  return (
    <BlindModeContext.Provider value={{ blindMode, toggleBlindMode }}>
      {children}
    </BlindModeContext.Provider>
  );
}

export function useBlindMode() {
  return useContext(BlindModeContext);
}

export default BlindModeContext;
