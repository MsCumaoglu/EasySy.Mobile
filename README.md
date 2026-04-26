This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

## Common Build & Configuration Errors

### 1. Android: `INSTALL_FAILED_UPDATE_INCOMPATIBLE`
**Error**: `Existing package com.easysy signatures do not match newer version; ignoring!`
**Cause**: The app currently installed on your emulator/device was signed with a different keystore than the one you are trying to install now.
**Solution**: Uninstall the existing app from your device/emulator before building again.
```sh
adb uninstall com.easysy
yarn android
```

### 2. Android: Firebase "Another project contains an OAuth 2.0 client that uses this same SHA-1 fingerprint..."
**Cause**: You are using the default React Native debug keystore, which is not globally unique. Another Google Cloud or Firebase project is already using this `SHA-1` + `Package Name` combination.
**Solution**: Generate a new, unique debug keystore:
```sh
cd android/app
rm debug.keystore
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Then, copy the newly generated `SHA1` fingerprint and add it to your Firebase Console under Project Settings > Your Apps (Android). Note: You must also uninstall the old app using the step above before rebuilding.

### 3. iOS: `Signing for "EasySy" requires a development team`
**Cause**: Xcode is attempting to build the app to a real, physical iPhone connected to your computer, but no Apple Developer Team has been assigned.
**Solution A (Use Simulator)**:
If you just want to run the app on a simulator without dealing with Apple ID signing, explicitly pass the simulator flag:
```sh
yarn ios --simulator="iPhone 15 Pro"
```
**Solution B (Use Physical Device)**:
If you want to run on your actual iPhone, you must assign your Apple ID:
1. Run `open ios/EasySy.xcworkspace` in your terminal.
2. In Xcode, select the **EasySy** project on the left sidebar.
3. Click the **Signing & Capabilities** tab.
4. Under the **Team** dropdown, select your Apple ID/Name.
5. Close Xcode and run `yarn ios` again.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
