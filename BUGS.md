# Bugs And Follow-Ups

## Open

- Dev server was not started during setup because the sandbox blocked launching a background process and the approval request was aborted.
- Vite dev mode currently fails during dependency optimization in this Windows/OneDrive sandbox. Production build and preview work.
- Microphone recording is connected for local browser sessions, but recordings are not persisted after refresh.
- Audio analysis currently returns a placeholder result.
- Coach chat uses mock responses.
- Settings form is not persisted.
- No backend, authentication, database, or cloud storage exists yet.
- Practice session completion persists locally per plan, but it is not synced across devices.

## Watch List

- Vite's default config loader failed in this environment with an esbuild directory access error. The scripts use `--configLoader runner`, which builds and previews successfully.
- The generated hero image is intentionally large for visual quality. Optimize before production if bundle size becomes a concern.
