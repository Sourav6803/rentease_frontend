# Address Refactor Plan

## Analysis

The address functionality currently lives **inline inside `app/(dashboard)/profile/page.tsx`** (a ~1240-line component). It is tangled with unrelated profile/security/preferences logic:

- **Type**: `Address` interface (L81–93)
- **State**: `addresses`, `showAddressDialog`, `editingAddress`, `addressForm`, `isSavingAddress` (L362, L377–380)
- **Data/CRUD**: `fetchAddresses`, `saveAddress`, `deleteAddress`, `setDefaultAddress`, `resetAddressForm` (L409–414, L469–494, L510–513)
- **UI**: `AddressCard` component (L278–330), the "Addresses" tab body (L823–859), and the full Address `<Dialog>` form (L1134–1202)

A second file, `app/(dashboard)/settings/address/page.tsx`, **exists but is completely empty** — a settings sidebar slot with no implementation.

**Goal**: extract the address feature into a self-contained, reusable component set, then consume it in both the profile Address tab and the (currently empty) settings address page — no behavior change, no typos/bugs.

## New files — `components/address/`

1. **`types.ts`** — `Address` interface + `AddressFormValues` (Partial) + `EMPTY_ADDRESS_FORM` constant. Single source of truth for the shape.
2. **`useAddresses.ts`** — headless hook owning all data + CRUD against `/api/v1/users/addresses`. Returns `{ addresses, isLoading, isSaving, fetchAddresses, saveAddress, deleteAddress, setDefaultAddress }`. Uses `useSession()` for the bearer token and `sonner` toast — same endpoints/messages as today.
3. **`AddressCard.tsx`** — presentational card (moved verbatim from profile L278–330), props: `address`, `onEdit`, `onDelete`, `onSetDefault`.
4. **`AddressFormDialog.tsx`** — the add/edit `<Dialog>` (moved from L1134–1202) with self-contained form state. Props: `open`, `onOpenChange`, `initial` (address being edited or null), `onSubmit`, `isSaving`. Validates required fields (line1/city/state/pincode) before submit.
5. **`AddressList.tsx`** — the orchestrator that ties the hook + card grid + form dialog + "Add address" header + empty state together. Optional props for reuse: `title`, `description`, `className`. This is the single component both pages drop in.
6. **`index.ts`** — barrel re-exporting the above.

## Edits to existing files

7. **`profile/page.tsx`** — remove the inline `Address` type, address state, the 5 CRUD functions, the `AddressCard` component, and the address `<Dialog>`. Replace the Addresses tab body (L823–859) with `<AddressList />`. Clean up now-unused imports (`Plus`, `MapPin` stays used elsewhere — will verify each before removing).
8. **`settings/address/page.tsx`** — implement from empty using `<SettingsCard>` (matching sibling settings pages like `account/page.tsx`) wrapping `<AddressList />`.
9. **`settings/components.tsx`** — add an `Addresses` item (`MapPin`, `/settings/address`) to `sidebarItems` so the page is reachable.
10. **`settings/layout.tsx`** — add `/settings/address` title/description to `pageTitles`.

## Design decisions

- **`useAddresses` is the seam**: both pages get identical behavior for free; the profile page keeps its exact endpoints and toast strings.
- **Form state lives inside `AddressFormDialog`**, seeded from `initial` via `useEffect` on open — prevents the stale-form bugs that inline shared state can cause, and makes the dialog independently reusable.
- **Auth token**: the extracted hook reads `session.user.accessToken` exactly as the profile page does today (not the settings `useSettings` hook, since address endpoints are `/users/addresses`, not `/settings/*`).
- **No visual change** in the profile tab — same Tailwind classes, same framer-motion `AnimatePresence`.

## Verification

- Grep the profile page after edits for dangling references to removed symbols (`addressForm`, `saveAddress`, etc.).
- Confirm no unused-import breakage (tsconfig has `strict: true` but **not** `noUnusedLocals`, so it won't fail the build — still cleaning up the obvious ones).
- Run `graphify update .` at the end per project rules.
