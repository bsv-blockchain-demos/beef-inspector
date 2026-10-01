# BEEF Inspector

A browser-based tool for inspecting BSV transactions supplied in BEEF format. The interface, labelled **BSV Transaction Debugger**, displays transaction metadata and diagnostic information from the BSV SDK.

## Current status

The validation indicator has a known correctness issue: the application treats a completed `Transaction.verify()` call as success without checking its boolean result. Transactions for which the SDK returns `false` can therefore appear as **VALID**. Use the tool for inspection while this issue remains unresolved; the displayed status is not a reliable validation decision.

## What it shows

- Transaction ID, version, input and output counts, lock time and serialised transaction size.
- Parsing and verification exceptions.
- A BEEF structure log when verification throws an exception.
- Input locking and unlocking scripts in assembly form when script diagnostics are available.
- Signature hash flag tooltips for recognised signature-shaped values.

## Run locally

Use Node.js 22 and npm.

```sh
git clone https://github.com/bsv-blockchain-demos/beef-inspector.git
cd beef-inspector
npm ci
npm run dev -- --host 127.0.0.1
```

Open `http://localhost:8080`, or the URL printed by Vite. No application server, database or environment file is required.

## Inspect a transaction

1. Paste a hex-encoded BEEF payload into **Transaction Hex (BEEF Format)**.
2. Select **Analyze Transaction**.
3. Review the transaction summary and any diagnostic sections that appear.

The input must contain BEEF data, including the source transactions or proofs needed for verification. A transaction ID or ordinary raw transaction hex is not the expected input format.

Parsing runs in the browser. Verification uses the SDK's default chain tracker and can make external requests when checking Merkle proofs. The interface does not expose network or chain tracker configuration.

## Build and preview

```sh
npm run build
npm run preview
```

The production bundle is written to `dist/`. Serve that directory with a static host. The project also defines `npm run lint` and `npm run build:dev`; it has no automated test script.

## Source guide

| File | Responsibility |
| --- | --- |
| [src/pages/Index.tsx](src/pages/Index.tsx) | BEEF parsing, SDK verification and diagnostic collection. |
| [src/components/TransactionInput.tsx](src/components/TransactionInput.tsx) | Hex input and submission. |
| [src/components/TransactionDetails.tsx](src/components/TransactionDetails.tsx) | Transaction summary and structure log. |
| [src/components/ScriptDebugger.tsx](src/components/ScriptDebugger.tsx) | Script diagnostics and signature hash tooltips. |
| [vite.config.ts](vite.config.ts) | Development server and build configuration. |

## Limitations

Diagnostics are collected primarily when verification throws an exception. A returned `false` currently bypasses that error-handling path. The size shown in the summary is the transaction's serialised size, rather than the size of the complete BEEF payload.

The script view displays error information and assembly. Opcode execution positions are not currently populated by the analysis code.

## Licence

No licence file is currently included in this repository.
