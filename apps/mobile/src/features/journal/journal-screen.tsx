import { freezerLb, personalBests, type SpeciesId } from "@bow-szn/core";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PixelButton } from "@/ui/pixel-button";
import { BACKGROUND, FONT_PIXEL, FOREGROUND } from "@/ui/theme";

import { FreezerPanel } from "./freezer-panel";
import { HarvestList } from "./harvest-list";
import { useJournal } from "./journal-provider";
import { SPECIES_ORDER } from "./species-art";
import { SpeciesCard } from "./species-card";

function leaveJournal() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

export function JournalScreen() {
  let { journal } = useJournal();
  let [openSpecies, setOpenSpecies] = useState<SpeciesId | null>(null);
  let bests = personalBests(journal);

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
