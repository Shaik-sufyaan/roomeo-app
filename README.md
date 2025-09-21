# Roomio Mobile App

A React Native mobile application for roommate and housing matching, converted from the original Next.js web application.

## 🏠 About

Roomio helps people find compatible roommates and housing. Users can create one of two profile types:
- **"Looking for Roommates"** - Have an apartment and need roommates
- **"Looking for Owners"** - Looking for a place to live

The app features a Tinder-style swipe interface where users only see profiles of the opposite type for optimal matching.

## 📱 Tech Stack

- **React Native** with Expo SDK 54
- **TypeScript** for type safety
- **Supabase** for backend (database, auth, storage)
- **Expo Router** for navigation
- **React Native StyleSheet** for styling (mobile-native approach)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd roomio-mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. Start the development server:
```bash
npx expo start
```

5. Run on device/simulator:
- **iOS**: Press `i` or scan QR code with Expo Go app
- **Android**: Press `a` or scan QR code with Expo Go app

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (buttons, inputs, etc.)
│   └── mobile/         # Mobile-specific components
├── screens/            # App screens/pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and helpers
├── services/           # API and external service integrations
├── types/              # TypeScript type definitions
└── utils/              # Additional utility functions
```

## ✨ Key Features

- **Authentication** - Secure login/signup with Supabase Auth
- **Profile Management** - Create and edit user profiles
- **Swipe Interface** - Tinder-style matching system
- **Real-time Chat** - Message matched users
- **Image Upload** - Profile photos with Supabase Storage
- **Push Notifications** - Stay updated with matches and messages

## 🔄 Web to Mobile Conversion

This app was converted from a Next.js web application using a "Type C" mobile-native approach:

- ✅ All web components rewritten as React Native components
- ✅ Tailwind CSS replaced with React Native StyleSheet
- ✅ DOM dependencies removed and replaced with React Native equivalents
- ✅ Mobile-specific features added (camera, push notifications, etc.)
- ✅ Expo modules integrated for enhanced mobile functionality

See `COMPONENT_CONVERSION_CHECKLIST.md` for detailed conversion progress.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test specific lib functions:
```bash
# Import and run in your app
import { runAllLibTests } from './src/lib/testLibFunctions';
runAllLibTests();
```

## 🚀 Deployment

### Building for Production

1. **iOS**:
```bash
npx expo build:ios
```

2. **Android**:
```bash
npx expo build:android
```

### App Store Deployment

Follow the [Expo deployment guide](https://docs.expo.dev/distribution/app-stores/) for publishing to App Store and Google Play.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [Expo documentation](https://docs.expo.dev/)
- Review the [Supabase documentation](https://supabase.com/docs)

---

**Note**: This is a mobile-native React Native application converted from a web app. For the original web version, see the main Roomio repository.