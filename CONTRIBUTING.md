# Contributing

Thanks for helping improve Stellar RWA Web.

## Workflow

1. Create a feature branch from `main`.
2. Keep changes focused on one issue or improvement at a time.
3. Run the relevant tests and type checks before opening a PR.

## Local setup

- Use Node.js 20.x with npm 10.x. These versions match CI and the `engines` declared in `package.json`.
- Copy [.env.example](.env.example) to `.env.local`.
- The project currently targets Stellar Testnet. Mainnet contract IDs are intentionally empty in the example env file.
- Install dependencies with `npm install` and start the app with `npm run dev`.

## Issuer dashboard: on-chain roles and failure behaviour

The three tabs in the issuer dashboard call privileged contract methods. Each
requires the connected wallet to be the asset's on-chain admin (the address
stored in `AssetMetadata.admin`, set at token deployment). All three tabs share
the same requirement — there is currently no finer-grained role separation
between them.

| Tab | Methods called | Required role |
|---|---|---|
| Token | `mint`, `pause`, `unpause` | asset-token `admin` |
| Compliance | `add_to_allowlist`, `suspend`, `remove`, `block_jurisdiction`, `unblock_jurisdiction` | compliance contract `admin` (set to the same address as the asset-token admin at deployment) |
| Distributions | `create_distribution` | dividend contract caller must be the asset-token address's registered issuer; in practice this is the same wallet that deployed the token |

### What happens when a non-admin wallet submits

The Soroban contract enforces the admin check and reverts the transaction with
an `Auth` error. `useTx` catches the revert, maps it to a human-readable
message, and surfaces it via the `TxProgress` component as a generic
"Transaction failed" toast. The UI does not currently distinguish an
authorisation failure from any other contract error — the issuer dashboard
assumes the connected wallet *is* the admin, and no warning is shown upfront if
it is not.

Planned improvement: compare `AssetMetadata.admin` against `useWallet().address`
on the client side before enabling the action buttons, and show a clear
"You are not the admin of this asset" notice instead of letting the transaction
fail on-chain.

## Verification

Run these commands before submitting:

```bash
npm run test
npm run typecheck
```

If you add UI changes, prefer updating or adding a focused component test alongside the implementation.
