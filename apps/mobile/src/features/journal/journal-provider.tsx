import { mount as mountHarvest, recordHarvest, type Harvest, type Journal } from "@bow-szn/core";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { deviceJournalStore, type JournalStore } from "@/platform/journal-store";

export type JournalApi = {
  journal: Journal;
  record(harvest: Harvest): void;
  mount(harvestId: string): void;
};

const JournalContext = createContext<JournalApi | null>(null);

type JournalProviderProps = {
  store?: JournalStore;
  children: ReactNode;
};

export function JournalProvider({ store = deviceJournalStore, children }: JournalProviderProps) {
  let [journal, setJournal] = useState(() => store.load());
  let latest = useRef(journal);

  let commit = useCallback(
    function commit(next: Journal) {
      if (next === latest.current) {
        return;
      }
      latest.current = next;
      store.save(next);
      setJournal(next);
    },
    [store]
  );

  let record = useCallback(
    function record(harvest: Harvest) {
      commit(recordHarvest(latest.current, harvest));
    },
    [commit]
  );

  let mount = useCallback(
    function mount(harvestId: string) {
      commit(mountHarvest(latest.current, harvestId));
    },
    [commit]
  );

  let api = useMemo(() => ({ journal, record, mount }), [journal, record, mount]);

  return <JournalContext.Provider value={api}>{children}</JournalContext.Provider>;
}

export function useJournal(): JournalApi {
  let api = useContext(JournalContext);
  if (api === null) {
    throw new Error("useJournal needs a JournalProvider above it.");
  }
  return api;
}
