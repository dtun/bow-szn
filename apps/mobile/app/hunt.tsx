import { useLocalSearchParams } from "expo-router";

import { HuntScreen } from "@/features/hunt/hunt-screen";

export default function HuntRoute() {
  let { seed } = useLocalSearchParams<{ seed?: string }>();

  return <HuntScreen seed={seed} />;
}
