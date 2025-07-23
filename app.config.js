export default {
  expo: {
    name: "Adivina qué",
    slug: "adivinaque-voxph4jsjecxdvew0lkzk",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "cover",
      backgroundColor: "#1E2A3E"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.adivinaque.app",
      // Configuraciones adicionales para estabilidad
      infoPlist: {
        NSCameraUsageDescription: "Esta app no usa la cámara"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/splash-icon.png",
        backgroundColor: "#1E2A3E"
      },
      package: "com.adivinaque.app",
      // Configuraciones adicionales para estabilidad
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "09da7685-f8d7-4b89-b9cd-9da26b1682ab"
      }
    },
    updates: {
      url: "https://u.expo.dev/09da7685-f8d7-4b89-b9cd-9da26b1682ab"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    owner: "alvaroarriagada",
    // Configuraciones adicionales para estabilidad
    plugins: [
      "expo-font",
      "expo-splash-screen"
    ],
    // Configuraciones de Metro para mejor rendimiento
    experiments: {
      tsconfigPaths: true
    }
  }
}; 