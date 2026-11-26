import {
  leaderboardScores,
  mount as mountHarvest,
  recordHarvest,
  type Harvest,
  type Journal,
} from "@bow-szn/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { deviceGameCenter, type GameCenter } from "@/platform/game-center";
import { deviceJournalStore, type JournalStore } from "@/platform/journal-store";

export type JournalApi = {
  journal: Journal;
  record(harvest: Harvest): void;
  mount(harvestId: string): void;
};

const JournalContext = createContext<JournalApi | null>(null);

type JournalProviderProps = {
  store?: JournalStore;
  gameCenter?: GameCenter;
  children: ReactNode;
};

function postScores(gameCenter: GameCenter, journal: Journal) {
  let scores = leaderboardScores(journal);
  if (Object.keys(scores).length > 0) {
    void gameCenter.submitScores(scores);
  }
}

export function JournalProvider({
  store = deviceJournalStore,
  gameCenter = deviceGameCenter,
  children,
}: JournalProviderProps) {
  let [journal, setJournal] = useState(() => store.load());
  let latest = useRef(journal);

  useEffect(() => {
    void gameCenter.authenticate().then((status) => {
      if (status === "signed-in") {
        postScores(gameCenter, latest.current);
      }
    });
  }, [gameCenter]);

  let commit = useCallback(
    function commit(next: Journal) {
      if (next === latest.current) {
        return;
      }
      latest.current = next;
      store.save(next);
      setJournal(next);
      postScores(gameCenter, next);
    },
    [store, gameCenter]
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
