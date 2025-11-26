import React from 'react';
import WelcomeScreenView from './screens/WelcomeScreenView';
import { Provider as PaperProvider } from 'react-native-paper';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpScreenView from './screens/SignUpScreenView';
import navview from './screens/navview';
import TrainingView from './screens/trainingview';
import StartScreen from './screens/StartScreenView';
import GenderScreenView from './screens/GenderScreenView';
import AgeScreenView from './screens/AgeScreenView';
import LoginScreenView from './screens/LoginScreenView';
enableScreens();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreenView} />
        <Stack.Screen name="SignUp" component={SignUpScreenView} />
        <Stack.Screen name="Login" component={LoginScreenView} />
        <Stack.Screen name="Nav" component={navview} />
        <Stack.Screen name="Training" component={TrainingView} />
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Gender" component={GenderScreenView} />
        <Stack.Screen name="Age" component={AgeScreenView} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
