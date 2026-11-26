import type { Harvest } from "@bow-szn/core";
import { useCallback, useRef, useState } from "react";

import type { Sharer } from "@/platform/share";

import type { CardRenderer } from "./use-card-renderer";

export const UNAVAILABLE_TOAST = "SHARING IS NOT AVAILABLE ON THIS DEVICE.";
export const FAILED_TOAST = "COULD NOT SHARE THAT MOUNT. TRY AGAIN.";

export function useShareMount(sharer: Sharer, renderCard: CardRenderer) {
  let [toast, setToast] = useState<string | null>(null);
  let sharing = useRef(false);

  let dismissToast = useCallback(function dismissToast() {
    setToast(null);
  }, []);

  async function shareMount(harvest: Harvest) {
    if (sharing.current) {
      return;
    }
    sharing.current = true;
    try {
      let png = await renderCard(harvest);
      let result = await sharer.sharePng(`bow-season-${harvest.id}.png`, png);
      if (result.kind === "unavailable") {
        setToast(UNAVAILABLE_TOAST);
      }
    } catch {
      setToast(FAILED_TOAST);
    } finally {
      sharing.current = false;
    }
  }

  return { shareMount, toast, dismissToast };
}
