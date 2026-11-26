import { PressStart2P_400Regular, useFonts } from "@expo-google-fonts/press-start-2p";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { JournalProvider } from "@/features/journal";
import { BACKGROUND } from "@/ui/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  let [loaded, error] = useFonts({ PressStart2P_400Regular });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <JournalProvider>
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BACKGROUND } }}
        />
      </JournalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BACKGROUND },
});
