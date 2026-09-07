# Brief memory and implementation contract

The original `prompt.md` and `brief.txt` are preserved. This file is durable project context, not a claim of memory across unrelated sessions. Read both originals and this file before changes.

## prompt.md, in document order

1. Create and critically evaluate a web app against brief.txt.
2. Completeness includes reachable functionality and unhappy paths.
3. Problem Solving & Design prioritizes the real user problem, clear UX and responsive design.
4. Technical Craft covers architecture, readability, security and detail.
5. Score 1–5: poor, below average, average, above average, exceptional.
6. Source above 40 KB or oversized/unstructured commits costs at least two Technical Craft points. Use the stricter 40,000-byte limit. Count tests, tooling and configuration, excluding .md/.txt; exclude .git and generated dependencies. Also report complete tracked-source accounting.
7. Evaluation must be the exact specified JSON object. Place it in EVALUATION.md as JSON, with a matching final JSON response. Put extended scoring and fixes in REPORT.md.
8. Calibration: functionality alone cannot excuse security or mobile defects.

## brief.txt, in document order

- Stamp Rally is a single-page, personal travel passport; no account or backend.
- Create entries with place, date picker, five-color palette (red, blue, green, purple, gold), short plain-text memory.
- Rectangular passport pages, large circular CSS-only ink stamps, initials, selected color, worn appearance and stable per-entry random tilt. Grid layout.
- Dream destinations are visibly faded with dashed borders; visited entries are solid. Status must be reversible, with a real date requested on visiting a dream.
- Always-visible counts distinguish collected stamps and remaining dreams.
- localStorage survives refresh. Deletion requires explicit confirmation.
- Brief scores use 0–100 in the same three categories; report alongside prompt's 1–5, without pretending to be official judging.

## Negative-statement audit, in original order

| # | Required positive counterpart, applied to this passport |
|---|---|
| 1 | Shared semantic color, type, space, motion tokens. |
| 2 | Corrupt data has persistent visible recovery notice; never silently seed or overwrite. |
| 3 | Separate model, storage, view, controller ES modules. |
| 4 | Automated tests cover validation, rendering model, counts and storage. |
| 5 | Explicit JSDoc contracts for state/functions. |
| 6 | Rendering isolated in view module with pure presentation helpers. |
| 7 | Named exported functions are independently testable. |
| 8 | Explicit entry type; not an inferred-only data contract. |
| 9 | Reduced motion removes entrance effects; no fake shuffling or irrelevant suspense. |
| 10 | Blocked storage reads show persistent warning and recovery action. |
| 11 | No monolithic IIFE/global application state. |
| 12 | Both load and save failures visible to user. |
| 13 | Guard parsing, storage, import/export and entry actions. |
| 14 | Load failures remain visible outside ephemeral toast. |
| 15 | Real startup loading/failure fallback; no artificial wait. |
| 16 | Enforce JSDoc using TypeScript checkJs; runtime schema validation at storage/import boundary. CoffeeEntry is unrelated. |
| 17 | Sticky desktop composer, delete dialog, status toast. |
| 18 | Filters have labeled group and aria-pressed, not navigation semantics. |
| 19 | Palette/status fieldsets have visible legends. Cocktail ingredients are unrelated. |
| 20 | Collection update announcements in live region. |
| 21 | Explicit empty-passport and no-search-results states. |
| 22 | Invalid records/actions visibly fail, never silently select defaults. |
| 23 | Validate action IDs and allowed actions before mutating entries. |
| 24 | Complete passport CRUD/status/counts/storage. People/gifts/collapsible sections are unrelated and not added. |
| 25 | Both passport statuses reversible; date retained when temporarily made a dream. Three gift states are unrelated. |
| 26 | Both counts remain visible independent of filters. Person headers are unrelated. |
| 27 | Delete dialog names exact stamp; one entry deleted per confirmation. |
| 28 | Persistent errors plus transient success announcements. |
| 29 | Save failure preserves composer fields and shows inline error as well as persistent warning. |
| 30 | Stable input IDs with matching labels. Episode fields are unrelated. |
| 31 | h1 within main; collection/composer h2; entry h3. |
| 32 | Dialog Escape/cancel clears pending action and restores focus; deletion moves focus predictably. |
| 33 | Exercise storage failures in tests and browser, verify rendered feedback. |
| 34 | npm test runs actual node:test suite; npm run check enforces types and size. |

## Design decisions to preserve

No fabricated personal history. Start empty with an illustrative, explicitly labeled sample passport page. Prioritize quick entry, rediscovering memories, reversible corrections, local data protection. Search/filter and backup/restore are justified supporting features. All core assets work without remote font/image/API requests.
