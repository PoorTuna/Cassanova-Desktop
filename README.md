# Cassanova Desktop

Desktop client for [Cassanova](https://github.com/PoorTuna/Cassanova).
Manages multiple instances from a single application.

## Requirements

- Node.js — version pinned in [`.nvmrc`](./.nvmrc)

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build          # compile main, preload, renderer
npm run package        # build + host-platform installer
npm run package:win    # nsis
npm run package:mac    # dmg + zip, x64 + arm64
npm run package:linux  # AppImage + deb
```

## Scripts

| Command | |
| --- | --- |
| `npm run dev` | Electron dev server with HMR |
| `npm run build` | Production bundle for all three processes |
| `npm run typecheck` | `tsc --noEmit` on node and web tsconfigs |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Architecture

Electron with separate main, preload, and renderer processes.

Each configured Cassanova instance renders in its own `<webview>` tag
bound to a dedicated `session` partition, so cookies and storage are
isolated between instances.

Credentials live in the OS keychain through `keytar` and never reach the
renderer. The main process authenticates by POSTing to the instance's
`/login` endpoint and writing the returned `access_token` cookie into
the matching webview session, so the user lands inside Cassanova
already signed in.

Self-signed certificates are handled with trust-on-first-use fingerprint
pinning per instance; a fingerprint mismatch on subsequent connects
raises a hard error rather than silently accepting the new cert.

## License

MIT
