# Cassanova Desktop

A Lens-style cross-platform desktop client for managing multiple
[Cassanova](https://github.com/PoorTuna/Cassanova) instances from a single app.

## Status

Early scaffold. See the implementation plan in the commit history. Phases:

- **Phase 0** — scaffold, toolchain, CI _(in progress)_
- **Phase 1** — minimum viable shell: sidebar + single webview
- **Phase 2** — credential vault (keytar) + auto-auth via cookie injection
- **Phase 3** — self-signed cert trust-on-first-use + health indicators
- **Phase 4** — packaging, signing, auto-update
- **Phase 5** — polish

## Architecture

Cassanova Desktop is a thin Electron shell. Each configured Cassanova instance
loads in its own `<webview>` with an isolated cookie partition. Credentials are
stored in the OS keychain via `keytar`. The main process performs authentication
by POSTing to each instance's `/login` endpoint and injecting the returned
`access_token` cookie into the webview's session, so users land inside Cassanova
already logged in.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build       # bundle main/preload/renderer
npm run package     # build + platform installer via electron-builder
```

## License

MIT
