<div align="center">

<img src="./assets/logo.png" alt="NutriFit Logo" width="200"/>

# NutriFit

**Your intelligent health & fitness companion**

*Track your nutrition, plan your workouts, and build healthy habits — all in one place.*

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/License-Private-red)](#)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Wellbeing & Privacy](#-wellbeing--privacy)
- [Contributing](#-contributing)

---

## 🥗 About

**NutriFit** is a cross-platform mobile application (iOS & Android) designed to help users take control of their health and fitness journey. It combines smart meal planning, personalized workout programs, and social accountability into a single, streamlined experience.

NutriFit connects to a dedicated FastAPI backend that handles user authentication, meal planning, workout scheduling, and AI-powered nutritional recommendations.

---

## ✨ Features

### 🏠 Dashboard
- Daily summary of meals and workouts planned
- Real-time caloric intake tracking with a visual progress bar
- Workout completion tracking with badge system
- Motivational messages and daily streaks

### 🥘 Diet & Recipes
- Browse a curated library of recipes with nutritional data
- Search recipes by name
- Add recipes to your personal favorites
- Share your favorite recipes with friends
- Full recipe detail view with ingredients and macros

### 🏋️ Training
- Browse available workout programs tailored to your goals and equipment
- Live workout session screen with step-by-step exercise timer
- Rest periods between sets with auto-progression
- Session completion tracking synced to the Dashboard

### 📅 Calendar
- Week-by-week planning view for meals and workouts
- Visual "Rest Day" card when no workout is planned — because recovery matters too
- Mark rest days as validated to build healthy habits

### 👤 Profile & Settings
- Full profile management (age, weight, height, diet, goal, equipment)
- BMR & daily calorie goal calculated via Mifflin-St Jeor formula
- BMI tracking with status indicator
- Donation support to contribute to the project

### 🤝 Community
- Add friends and manage friend requests
- Search for other users by name
- View friends' profiles, favorite recipes, and programs
- Real-time friend request notification badge (nav bar & profile)

### 🧠 AI Nutritionist Chat
- Integrated AI-powered chat assistant for personalized nutritional advice
- Context-aware recommendations based on your profile and goals

### 🛡️ Wellbeing & Accessibility
- **Blind Mode** — hide all calorie and macro data across the entire app to reduce mental strain related to eating disorders (EDs)
- **Account Pause** — temporarily suspend your account during holidays or recovery periods without losing progress
- **Safety Disclaimer** — a health reminder is displayed before every workout session

### 🔐 GDPR Compliance
- Full account deletion with double confirmation (GDPR Article 17 — Right to Erasure)
- All personal data removed upon request

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

| Tool | Version | Download |
|---|---|---|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org/) |
| npm | ≥ 9.x | Included with Node.js |
| Expo CLI | Latest | `npm install -g expo-cli` |
| Expo Go (mobile) | Latest | [App Store](https://apps.apple.com/app/expo-go/id982107779) / [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) |

> **Optional:** Android Studio or Xcode for running on an emulator/simulator.

---

### Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd Nutrifit
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure the API base URL**

Open `api/config.js` and set the URL pointing to your running NutriFit backend:

```js
// api/config.js
export const BASE_URL = "http://YOUR_BACKEND_IP:8000";
```

> ⚠️ When testing on a physical device, use your machine's **local network IP address**, not `localhost`.

---

### Running the App

**Start the Expo development server:**
```bash
npm start
# or
npx expo start
```

Then:
- **Physical device** — Scan the QR code with the [Expo Go](https://expo.dev/client) app
- **Android emulator** — Press `a` in the terminal
- **iOS simulator** — Press `i` in the terminal (macOS only)
- **Web browser** — Press `w` in the terminal

---

## 📁 Project Structure

```
Nutrifit/
├── api/                    # API layer — all backend calls
│   ├── axiosInstance.js    # Axios client with JWT interceptor
│   ├── auth.js             # Authentication (login, register)
│   ├── calendrier.js       # Calendar & planning endpoints
│   ├── exercices.js        # Exercises library
│   ├── favoris.js          # Favorites management
│   ├── profileAPI.js       # User profile endpoints
│   ├── recettes.js         # Recipes endpoints
│   ├── seances.js          # Workout sessions endpoints
│   ├── social.js           # Friends, search, share endpoints
│   ├── chat.js             # AI chat endpoint
│   ├── paymentAPI.js       # Donation / Stripe integration
│   └── config.js           # Base URL configuration
│
├── components/             # Main screen components
│   ├── dashboard.js        # Home dashboard
│   ├── diet.js             # Recipe browser
│   ├── training.js         # Training programs
│   ├── calendar.js         # Planning calendar
│   ├── profile.js          # User profile & settings
│   ├── activeWorkout.js    # Live workout session
│   ├── recipeDetail.js     # Recipe detail view
│   ├── Favorites.js        # Favorites screen
│   ├── CommunityScreen.js  # Friends management
│   ├── FriendProfileScreen.js  # Friend's public profile
│   ├── ChatModal.js        # AI nutritionist chat
│   ├── DonationModal.js    # Donation interface
│   └── nav.js              # Bottom tab navigation
│
├── screens/                # Screen wrappers (navigation entry points)
├── assets/                 # Images, icons, fonts
│
├── App.js                  # App entry point & navigation root
├── AuthContext.js          # Authentication context
├── BlindModeContext.js     # Global Blind Mode state (AsyncStorage)
├── ChatContext.js          # AI chat state
├── PlayerContext.js        # Workout player state
└── package.json
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev/) 0.81.5 |
| Build System | [Expo](https://expo.dev/) 54.0 |
| Navigation | [React Navigation](https://reactnavigation.org/) v7 |
| HTTP Client | [Axios](https://axios-http.com/) 1.13 |
| Local Storage | [@react-native-async-storage](https://react-native-async-storage.github.io/async-storage/) |
| Icons | [@expo/vector-icons](https://docs.expo.dev/guides/icons/) (Ionicons, MaterialCommunityIcons) |
| Progress UI | [react-native-progress](https://github.com/oblador/react-native-progress) |
| Safe Areas | [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) |
| Backend | FastAPI (Python) — separate repository |
| Auth | JWT Bearer Token |
| Payments | Stripe (sandbox) |

---

## 🛡️ Wellbeing & Privacy

NutriFit is built with user wellbeing at its core:

- **Eating Disorder Prevention** — The Blind Mode feature allows users to hide all numerical nutritional data (calories, macros) across the entire app, reducing the mental pressure associated with numbers.
- **Rest Valorization** — The app actively celebrates rest days with a dedicated card, reinforcing that recovery is an essential part of any fitness journey.
- **Workout Safety** — A safety disclaimer is displayed before every workout session, reminding users to warm up, stay hydrated, and listen to their body.
- **Data Privacy** — Users can permanently delete their account and all associated data at any time, in compliance with **GDPR Article 17** (Right to Erasure). This action requires a double confirmation step to prevent accidental deletions.

---

## 🤝 Contributing

This project is developed as part of an academic program (SAE — M1). Contributions from the core team are managed through the shared GitHub repository.

**Commit convention:**
```
feat: add blind mode toggle to profile settings
fix: notification badge now reflects real pending requests
chore: update API base URL configuration
```

---

<div align="center">

Made with ❤️ by the NutriFit Team — M1 SAE 2025–2026

</div>
