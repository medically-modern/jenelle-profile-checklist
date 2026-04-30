# Checklist Dashboard Template — Developer Guide

> **Audience:** A future Claude (or human dev) spinning up a new Monday-backed checklist dashboard for Medically Modern. This template was extracted from the Samantha-checklist repo with all domain logic stripped out.

## What This Template Is

A blank, working React dashboard that:
- Reads patient/item data from a Monday.com board
- Displays a sidebar list + two-tab layout with checklist panels
- Keeps edits local until the user clicks "Send to Monday"
- Deploys to GitHub Pages via GitHub Actions

The reference implementation is [Samantha-checklist](https://github.com/medically-modern/Samantha-checklist) — a fully built-out version of this template for insurance/benefits verification.

## Stack

React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui components.

## How to Create a New Dashboard From This Template

### Step 0: Create the GitHub repo and copy files

```bash
# Create a new empty repo on GitHub under medically-modern, e.g.:
# https://github.com/medically-modern/my-new-checklist

# Copy this template folder
cp -r checklist-dashboard-template my-new-checklist
cd my-new-checklist
git init && git branch -M main
```

### Step 1: Update project identity

These files contain the repo name — find/replace the placeholder with your new repo name:

| File | What to change |
|---|---|
| `package.json` | `"name"` field |
| `index.html` | `<title>`, og:title, twitter:title, description |
| `src/App.tsx` | `basename` prop on `<BrowserRouter>` (must match repo name: `/my-new-checklist`) |
| `.github/workflows/deploy.yml` | `--base=/my-new-checklist/` in the build step |
| This file (CLAUDE.md) | Repo URL, live URL |

### Step 2: Wire up Monday.com board

All Monday configuration lives in `src/lib/mondayApi.ts`. You need three things:

**a) Board ID** — Find it in the Monday board URL (`monday.com/boards/XXXXXXXXXX`). Set:
```ts
export const BOARD_ID = 12345678901; // your board ID
```

**b) Group IDs** — These are the row-groups on your Monday board. Find them via Monday API or the board URL when clicking a group. Set:
```ts
export const GROUPS = {
  default: "new_group_xxxxx",        // the group to read patients from
  // add more groups if your workflow has multiple stages
} as const;
```

**c) Column IDs** — These are the Monday column identifiers your dashboard reads from and writes to. Find them via the Monday API (`boards { columns { id title } }`) or by inspecting column settings in Monday. Set:
```ts
export const COL = {
  dob: "text_xxxxx",
  insurance: "color_xxxxx",
  notes: "long_text_xxxxx",
  // ... add all columns you need
} as const;

export const READ_COLUMN_IDS = [
  COL.dob,
  COL.insurance,
  // ... only columns you need to READ (keeps API fast)
];
```

**Performance note:** Column count is the main Monday API bottleneck. Only add columns to `READ_COLUMN_IDS` that you actually display. Write-only columns should NOT be in this array.

### Step 3: Define your data model

Edit `src/lib/workflow.ts`:

```ts
export interface Patient {
  id: string;
  name: string;
  dob: string;
  notes: string;
  receivedAt: string;
  lastUpdated: string;
  checklist: Record<string, boolean>;
  // ADD your workflow-specific fields:
  // insurance?: string;
  // status?: "pending" | "approved" | "denied";
  // etc.
}
```

Also define your checklist items here:
```ts
export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "item-1", label: "First check", hint: "What to look for" },
  { id: "item-2", label: "Second check" },
  // ...
];
```

### Step 4: Map Monday data → Patient

Edit `src/lib/mondayMapping.ts`. The `mondayItemToPatient` function converts a raw Monday API item into your Patient object:

```ts
export function mondayItemToPatient(item: MondayItem): Patient {
  const cv = (id: string) => item.column_values.find((c) => c.id === id);
  return {
    id: item.id,
    name: item.name,
    dob: cv(COL.dob)?.text ?? "",
    notes: cv(COL.notes)?.text ?? "",
    // ... map all your fields
    receivedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    checklist: {},
  };
}
```

### Step 5: Build out UI panels

The dashboard ships with two placeholder panels in `src/components/dashboard/`:

- `ChecklistPanel.tsx` — Main tab content. Render your checklist items here.
- `SecondaryPanel.tsx` — Second tab content. Rename and customize, or delete if single-tab.

Also customize:
- `PatientProfileCard.tsx` — The card at the top showing patient info. Add fields as needed.
- `PatientsSidebar.tsx` — The sidebar showing the patient list. Customize the subtitle/metadata shown per patient.
- `src/pages/Index.tsx` — The main page. Wire up event handlers, rename tabs, add/remove tabs as needed.

For reference, see how Samantha-checklist implements `InsurancePanel.tsx` and `AuthorizationsPanel.tsx`.

### Step 6: Implement write-back to Monday

Edit `src/lib/mondayWrite.ts`. The `sendPatientToMonday` function fires when the user clicks "Send to Monday":

```ts
import { writeStatusIndex, writeLongText, writeDropdownIds, COL } from "./mondayApi";

export async function sendPatientToMonday(p: Patient): Promise<void> {
  const tasks: Promise<unknown>[] = [];
  
  // Write a status column (dropdown) by index:
  // tasks.push(writeStatusIndex(p.id, COL.someStatus, 1));
  
  // Write a long-text column:
  // tasks.push(writeLongText(p.id, COL.notes, p.notes));
  
  // Write a multi-select dropdown:
  // tasks.push(writeDropdownIds(p.id, COL.someDropdown, [1, 3]));
  
  await Promise.all(tasks);
}
```

**Important pattern:** The app keeps ALL edits local in the browser until "Send to Monday" is clicked. This is intentional — it batches all writes into one call and avoids hammering the Monday API.

### Step 7: Deploy

1. Push to GitHub
2. Go to repo Settings → Pages → Source: **GitHub Actions**
3. Add the Monday API token as a repo secret: Settings → Secrets → `VITE_MONDAY_API_TOKEN`
4. Push to `main` — the workflow builds and deploys automatically
5. Your dashboard will be live at `https://medically-modern.github.io/my-new-checklist/`

## Architecture Overview

```
Monday Board ──(read)──→ useMondayPatients hook ──→ React state ──→ UI
                                                        ↑
                                                   local edits
                                                        ↓
                                              "Send to Monday" button
                                                        ↓
                              Monday Board ←──(write)── mondayWrite.ts
```

The hook polls Monday every 30 seconds. Local edits are stored in an overlay ref so they survive re-fetches. When the user clicks "Send to Monday," `mondayWrite.ts` pushes everything in one batch.

## Key Files Reference

| File | Purpose | When to edit |
|---|---|---|
| `src/lib/mondayApi.ts` | Board ID, column IDs, GraphQL helpers | First — this is your board config |
| `src/lib/workflow.ts` | Patient type, checklist items, types | Define your data model |
| `src/lib/mondayMapping.ts` | Monday item → Patient | Parse Monday columns into your model |
| `src/lib/mondayWrite.ts` | Patient → Monday writes | Implement write-back logic |
| `src/lib/hcpcRules.ts` | Domain-specific business rules | Optional — add if you have complex rules |
| `src/hooks/useMondayPatients.ts` | Fetch + poll + overlay hook | Rarely — it's generic |
| `src/pages/Index.tsx` | Main page, tabs, handlers | Customize layout and wire handlers |
| `src/components/dashboard/*.tsx` | UI panels | Build your checklist UI |
| `.github/workflows/deploy.yml` | CI/CD | Only if changing build steps |

## Monday API Quick Reference

The GraphQL helpers in `mondayApi.ts` are ready to use:

- `fetchGroupItems(groupId)` — Read items from a board group
- `writeStatusIndex(itemId, columnId, index)` — Write a status/dropdown column by option index
- `writeLongText(itemId, columnId, text)` — Write a long-text column
- `writeDropdownIds(itemId, columnId, ids)` — Write a multi-select dropdown by option IDs

To find column option indices, query Monday:
```graphql
query {
  boards(ids: [YOUR_BOARD_ID]) {
    columns { id title settings_str }
  }
}
```

## Common Patterns From Samantha-checklist

If you need inspiration, these patterns from the reference implementation are worth studying:

- **Universal checks** (confirm/not-confirmed toggles): See `UNIVERSAL_CHECKS` in workflow.ts
- **Per-product status tracking**: See `ProductCodeState` and the codes map in `InsuranceState`
- **Derived outcomes** (auto-compute from multiple inputs): See `deriveInsuranceOutcome()`
- **Multi-group reads** (Auth tab pulls from different Monday groups): See the `GROUPS` object
- **Conditional write logic** (different columns written based on state): See `sendPatientToMonday()`
