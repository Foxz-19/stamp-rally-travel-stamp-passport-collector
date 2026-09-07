# Stamp Rally

A personal travel passport: CSS ink stamps, short memories, and places still on your wish list. Everything stays in localStorage in this browser. No backend, login, images, fonts fetched from the network, or runtime packages.

## Run

Requires Node.js; verified with Node 24.12.0.

```sh
npm start
```

Open http://127.0.0.1:4173. Serve over HTTP, rather than opening index.html as a file. Any static host can serve `index.html`, `styles.css`, and `js/` without a build step. The included server is for local development, bound to loopback.

```sh
npm install --ignore-scripts --package-lock=false
npm test
npm run check
```

The only development dependency is pinned TypeScript 5.9.3 for strict checkJs. `npm test` uses Node's built-in test runner. `npm run check` checks types and enforces 40,000 bytes. No compilation artifacts are needed.

## Use

1. Enter a place, visit date, ink and optional short memory. For a dream destination, the planned date is optional.
2. Edit a card to correct details. “I've been here” opens the date composer before collecting a dream. “Make a dream” is reversible.
3. Search places/memories or filter statuses; the summary always counts the whole passport.
4. Delete opens a named confirmation; Escape or Keep stamp cancels.
5. Back up downloads versioned JSON. Restore validates it and asks before replacing the entire passport. Empty backups intentionally restore an empty passport.

Storage failures remain visible; unsuccessful saves preserve the form and previous data. Corrupt data is never automatically overwritten. Download original data preserves its raw contents; restore a valid backup to recover. Retry storage reloads persistent state while retaining draft fields. Backups are plain text: keep them somewhere appropriate for your memories.

Storage is specific to browser, profile and site origin. Clearing site data removes the passport. Export before changing browser or host. No account or cross-device sync is implied.

## Source map

- `js/model.js`: explicit types, runtime record validation, date rules, counts, selection and initials.
- `js/storage.js`: versioned parsing, guarded reads/writes and compare-before-write conflict detection.
- `js/view.js`: escaped rendering, passport cards, summary and empty states.
- `js/main.js`: application state, events, form, confirmations and backup/restore.
- `test/app.test.mjs`: seven grouped automated tests.
- `scripts/size.mjs`: raw-byte inventory and failing size gate.

See [REQUIREMENTS.md](REQUIREMENTS.md) for the durable brief/rubric mapping, [REPORT.md](REPORT.md) for fixes, verification, scoring and recommendations, and [EVALUATION.md](EVALUATION.md) for the requested JSON evaluation. The original prompt and brief remain untouched; this repository's pre-existing `.git/info/exclude` hides them from Git.
