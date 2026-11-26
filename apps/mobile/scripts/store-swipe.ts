import { huntFlowFor } from "./store-shot-flow.ts";
import { planStoreShot } from "./store-shot.ts";

process.stdout.write(huntFlowFor(planStoreShot()));
