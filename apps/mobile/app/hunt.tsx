import { useLocalSearchParams } from "expo-router";

import { HuntScreen } from "@/features/hunt/hunt-screen";

export default function HuntRoute() {
  let params = useLocalSearchParams();

  return <HuntScreen {...params} />;
}
