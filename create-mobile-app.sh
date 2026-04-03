#!/bin/bash

# ViteCredit Mobile App Generator
# Creates Expo React Native app that shares Firebase backend with web

echo "📱 Creating ViteCredit Mobile App..."
echo "=================================="

# Create Expo app
npx create-expo-app vitecredit-mobile

cd vitecredit-mobile

echo ""
echo "📦 Installing Firebase packages..."
npx expo install expo-camera
npx expo install expo-notifications
npx expo install firebase
npx expo install @react-native-async-storage/async-storage
npx expo install expo-permissions
npx expo install expo-image-picker

echo ""
echo "✓ Expo app created: vitecredit-mobile"
echo ""
echo "📋 Next steps:"
echo "1. cd vitecredit-mobile"
echo "2. Copy src/lib/firebase.ts to mobile app"
echo "3. Copy src/lib/foodRecognition.ts to mobile app"
echo "4. Copy src/lib/dataService.ts to mobile app"
echo "5. Update imports for React Native (no React-specific code)"
echo "6. npx expo start"
echo ""
echo "📸 Mobile Features Ready:"
echo "✓ Camera integration (expo-camera)"
echo "✓ Push notifications (expo-notifications)"
echo "✓ Firebase backend (shared with web)"
echo "✓ Image picker (expo-image-picker)"
echo ""
echo "App.tsx template for mobile:"
echo "import * as Camera from 'expo-camera';"
echo "import * as Notifications from 'expo-notifications';"
echo "import { auth, db } from './src/lib/firebase';"
echo ""
echo "Happy coding! 🚀"
