import { PALETTE } from "@bow-szn/pixels";
import { trophyRoom } from "@bow-szn/core";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useJournal } from "@/features/journal";
import { PixelButton } from "@/ui/pixel-button";
import { BACKGROUND, FONT_PIXEL, FOREGROUND, NAVY, SKY } from "@/ui/theme";

import { MountCard } from "./mount-card";
import { WoodWall } from "./wood-wall";

function leaveTrophyRoom() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

export function TrophyRoomScreen() {
  let { journal } = useJournal();
  let mounts = trophyRoom(journal);

  return (
    <View testID="trophyRoomScreen" style={styles.screen}>
      <WoodWall />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <PixelButton
            label="BACK"
            testID="trophyRoomBackBtn"
            tone="navy"
            onPress={leaveTrophyRoom}
          />
          <Text accessibilityRole="header" style={styles.title}>
            TROPHY ROOM
          </Text>
        </View>
        {mounts.length === 0 ? (
          <View style={styles.empty}>
            <Text testID="trophyRoomEmpty" style={styles.emptyText}>
              NO MOUNTS YET. BUCKS CAN BE MOUNTED FROM THE HARVEST CARD.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.mounts}>
            {mounts.map((harvest) => (
              <MountCard key={harvest.id} harvest={harvest} />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  title: {
    fontFamily: FONT_PIXEL,
    fontSize: 16,
    color: FOREGROUND,
    textShadowColor: PALETTE.E,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  mounts: { paddingBottom: 24 },
  empty: { flex: 1, justifyContent: "center", padding: 24 },
  emptyText: {
    fontFamily: FONT_PIXEL,
    fontSize: 10,
    lineHeight: 18,
    textAlign: "center",
    color: FOREGROUND,
    padding: 16,
    backgroundColor: NAVY,
    borderWidth: 4,
    borderColor: SKY,
  },
});
