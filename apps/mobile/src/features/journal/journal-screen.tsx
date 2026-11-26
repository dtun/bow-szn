import { freezerLb, personalBests, type SpeciesId } from "@bow-szn/core";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PixelButton } from "@/ui/pixel-button";
import { PixelToast } from "@/ui/pixel-toast";
import { BACKGROUND, FONT_PIXEL, FOREGROUND } from "@/ui/theme";

import { FreezerPanel } from "./freezer-panel";
import { HarvestList } from "./harvest-list";
import { useJournal } from "./journal-provider";
import { SPECIES_ORDER } from "./species-art";
import { SpeciesCard } from "./species-card";

const SIGN_IN_TOAST = "SIGN IN TO GAME CENTER IN SETTINGS";

function leaveJournal() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

export function JournalScreen() {
  let { journal, showLeaderboards } = useJournal();
  let [openSpecies, setOpenSpecies] = useState<SpeciesId | null>(null);
  let [signInHint, setSignInHint] = useState(false);
  let bests = personalBests(journal);

  let hideSignInHint = useCallback(function hideSignInHint() {
    setSignInHint(false);
  }, []);

  async function openLeaderboards() {
    if ((await showLeaderboards()) !== "signed-in") {
      setSignInHint(true);
    }
  }

  return (
    <SafeAreaView testID="journalScreen" style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <PixelButton label="BACK" testID="journalBackBtn" tone="navy" onPress={leaveJournal} />
          <Text accessibilityRole="header" style={styles.title}>
            JOURNAL
          </Text>
        </View>
        <FreezerPanel lb={freezerLb(journal)} />
        <PixelButton
          label="TROPHY ROOM"
          testID="trophyRoomBtn"
          tone="brown"
          accessibilityHint="Shows your mounted bucks"
          onPress={() => router.push("/trophy-room")}
        />
        <PixelButton
          label="LEADERBOARDS"
          testID="leaderboardsBtn"
          tone="navy"
          accessibilityHint="Opens the Game Center leaderboards"
          onPress={openLeaderboards}
        />
        {openSpecies === null ? (
          <View style={styles.grid}>
            {SPECIES_ORDER.map((species) => (
              <SpeciesCard
                key={species}
                species={species}
                best={bests[species]}
                onPress={() => setOpenSpecies(species)}
              />
            ))}
          </View>
        ) : (
          <HarvestList
            species={openSpecies}
            harvests={journal.harvests}
            mountedIds={journal.mountedIds}
            onClose={() => setOpenSpecies(null)}
          />
        )}
      </ScrollView>
      {signInHint ? (
        <PixelToast testID="leaderboardsToast" message={SIGN_IN_TOAST} onDone={hideSignInHint} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  content: { padding: 16, gap: 16 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: FONT_PIXEL, fontSize: 18, color: FOREGROUND },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
});
