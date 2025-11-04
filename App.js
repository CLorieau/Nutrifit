import React from 'react';
import NavView from "./screens/navview";
import { Provider as PaperProvider } from 'react-native-paper';
import { enableScreens } from 'react-native-screens';

enableScreens();

export default function App() {
  return (
      <PaperProvider>
        <NavView />
      </PaperProvider>
  );
}
