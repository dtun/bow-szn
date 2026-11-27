# ADR-0005: The device keeps what the journal cannot read

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

The journal is the only data the player keeps. `journal-store.ts` loads it from one key, `bow-season.journal`, and every change to the journal saves the whole journal back to that key.

That design lost harvests. When the build could not read the stored text, `load` returned an empty journal, and the next `save` wrote that empty journal plus one new harvest over the stored text. The text the build could not read was any of these.

- A journal from a newer build, with a `version` this build does not know.
- A harvest this build rejects, such as one with an unknown species, spot, or season.
- A harvest with a field this build does not know.
- Text that is not JSON.

One bad harvest beside twenty good ones was enough. The player shot something and every harvest on the device was gone. The tests in `journal-store.test.ts` reproduce each case.

## Decision

The store never writes over stored text unless the journal it is saving already holds everything that text holds. It copies the text it cannot account for, verbatim, to a write-once archive key first, and it merges the archives back into the journal on every load.

**Device layout.** `bow-season.journal` holds this build's page, `{ version, harvests, mountedIds }`. `bow-season.journal.archive.<n>` holds text that some build could not account for. The numbers start at 1 and have no gaps. The store never changes or removes an archive. It finds the archives by reading keys 1, 2, 3, and so on until `getItem` returns null.

**Save rule.** `save` reads the text at the main key before it writes. If the key holds text and the journal being saved does not hold everything in that text, `save` copies the text to the next free archive key, then writes the main key. If the archives already hold identical text, `save` skips the copy, so a retry after a crash between the two writes does not archive the text twice. If the read, the archive write, or the main write throws, `save` warns "The journal could not be saved." and leaves the main key alone.

**What "holds everything" means.** `readPage` parses a text into a journal and a flag, `whole`. A text is whole when the page this build would write from what it read has the same JSON as the text, ignoring the order of keys. A skipped harvest, an unknown field at any depth, a mounted id that is not a string, or an extra top-level key makes the text not whole. A journal holds everything in a text when the text is whole and absorbing it changes nothing. To absorb a text, the store records its harvests and mounts its ids through `recordHarvest` and `mount` from `@bow-szn/core`. Both return the same journal when they change nothing.

**Merge order.** `load` reads the archives from oldest to newest, then the main key. It absorbs each text, through `readPage`, into a journal that starts empty. Older harvests come first. When two texts hold a harvest with the same id, the first occurrence wins.

**Reading by row.** A harvest that fails validation is left out, and the harvests beside it load. The text with the rejected harvest is not whole, so the next save archives it and the rejected harvest stays on the device. A text this build cannot read at all, because it is not JSON, is not an object, has another `version`, or has harvests or mounted ids that are not lists, loads as an empty journal and is archived the same way.

**Versions.** A text with a newer `version` is archived, and this build then writes its own version 1 page. Nothing is sealed or migrated. Any change to the stored shape bumps `JOURNAL_VERSION`, and the build that bumps it reads every older version. A later build that reads version 2 also reads the version 1 text in an archive.

**Validation.** A stored species must be an own key of `SPECIES`, a spot an own key of `SPOTS`, and a season a member of `SEASON_IDS`. A name such as `constructor` is rejected. The returned harvest is typed `Harvest`, so a new required field fails the build until the parser reads it.

## Consequences

- A player never loses a harvest to an unreadable text. The cost is that a corrupt journal stays on the device, in an archive, for good.
- The player gets no notice that the store set something aside. The journal shows what loaded and says nothing about what did not.
- Archives are never pruned. Each distinct unreadable text adds one. A player who moves between a newer and an older build adds one for each round trip, because the older build cannot read the page the newer build wrote.
- `load` reads every archive on every launch. The archives are small and rare, so this is accepted until a player has many.
- A save whose read throws is skipped. The journal in memory runs ahead of the device until a later save succeeds.
- The merge assumes harvests and mounts are never removed. A feature that deletes a harvest or unmounts a trophy must change the merge first, or the next load brings the deleted data back from an archive.
- The archive key names are a stored contract, so the tests write them as literals.
