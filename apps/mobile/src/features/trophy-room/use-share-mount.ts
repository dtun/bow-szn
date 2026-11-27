import type { Harvest } from "@bow-szn/core";
import { useCallback, useRef, useState } from "react";

import type { Sharer } from "@/platform/share";

import type { CardRenderer } from "./use-card-renderer";

export const SITE_URL = "https://dtun.github.io/bow-szn/";
export const SHARE_MESSAGE = `BOW SEASON. 8-BIT BOW HUNTING. ${SITE_URL}`;
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
      await sharer.sharePng({
        fileName: `bow-season-${harvest.id}.png`,
        png,
        message: SHARE_MESSAGE,
      });
    } catch {
      setToast(FAILED_TOAST);
    } finally {
      sharing.current = false;
    }
  }

  return { shareMount, toast, dismissToast };
}
