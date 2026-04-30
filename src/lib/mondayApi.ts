// Monday.com GraphQL client — direct from browser.
// Token is read from VITE_MONDAY_API_TOKEN at build time.

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_VERSION = "2024-10";

export const BOARD_ID = 18406352652;

export const GROUPS = {
  intake: "group_mm1xf2jb",
  parachuteExample: "group_mm1x1416",
  tests: "group_mm1wvq8p",
  stuck: "group_mm1xyczx",
  completed: "group_mm1y57sz",
} as const;

export const COL = {
  // ── Stedi ──
  runStediEligibility: "color_mm1yeksx",
  stediEligibilityActive: "text_mm1xpgy2",
  stediCoverageType: "text_mm25pxed",
  stediPayerName: "text_mm25wrxw",
  stediMedicareAdvantage: "text_mm25j9aj",
  stediMedicareAdvantageCarrier: "text_mm25pyfx",
  stediMedicareAdvantageMemberId: "text_mm25j9j7",
  stediQmb: "text_mm25zsdd",
  stediMedicareJurisdiction: "text_mm298skc",
  stediMedicaidMltc: "text_mm29kccv",
  stediManagedMedicaid: "text_mm2vyta1",
  stediInNetwork: "text_mm1xehx8",
  stediPriorAuthRequired: "text_mm1xhymg",
  stediCoinsurance: "text_mm1xssyw",
  stediCopay: "text_mm1xzqe0",
  stediIndividualDeductible: "text_mm1x46kd",
  stediIndividualDeductibleRemaining: "text_mm1xyga2",
  stediFamilyDeductible: "text_mm1x7hkk",
  stediFamilyDeductibleRemaining: "text_mm1xyzqx",
  stediIndividualOopMax: "text_mm1xdtxq",
  stediIndividualOopMaxRemaining: "text_mm1x32jw",
  stediFamilyOopMax: "text_mm1xqmg9",
  stediFamilyOopMaxRemaining: "text_mm1xkdgq",
  stediPlanBeginDate: "text_mm1xsa9",
  stediErrorDescription: "text_mm1x9tje",
  stediSecondaryMedicaidId: "text_mm25bjz7",
  stediPlanName: "text_mm1xdcet",

  // ── Insurance ──
  primaryInsurance: "color_mm1xg10n",
  generalInsurance: "color_mm24ap4j",
  memberId1: "text_mm1x2qk2",
  memberId2: "text_mm1xaccx",
  secondaryInsurance: "color_mm1zbrx0",

  // ── Doctor ──
  doctorStatus: "color_mm1ychz8",
  doctorName: "text_mm1x46et",
  doctorPhone: "phone_mm1xz8c0",
  doctorNpi: "text_mm1x7d91",
  clinicalsMethod: "color_mm1xw7y5",
  doctorEmail: "email_mm1x6fq5",
  doctorFax: "email_mm1xdzcj",
  clinicName: "dropdown_mm1xbvas",
  clinicAddress: "location_mm1xjnfv",

  // ── Serving / Product ──
  referralType: "color_mm1wm4n4",
  referralSource: "color_mm1w5wxr",
  pumpType: "color_mm1wjjtk",
  cgmType: "color_mm1w7pmf",
  requestType: "color_mm1w1978",
  cgmCrossSell: "color_mm1yets8",
  serving: "color_mm1w1cm9",
  insulinPumpCoveragePath: "color_mm1w5xn1",
  cgmCoveragePath: "color_mm1w7e5q",

  // ── Demographics (for profile card) ──
  dob: "text_mm1xvxst",
  ptPhone: "phone_mm1x44yk",
  email: "text_mm1xc140",
  gender: "color_mm1x1bdg",
  dateOfIntake: "date_mm1wf43j",
} as const;

// Columns we fetch on every read. Keep minimal to avoid 503s.
export const READ_COLUMN_IDS: string[] = Object.values(COL);

export interface MondayColumnValue {
  id: string;
  text: string | null;
  value: string | null;
}

export interface MondayItem {
  id: string;
  name: string;
  column_values: MondayColumnValue[];
}

function getToken(): string {
  return (import.meta.env.VITE_MONDAY_API_TOKEN as string | undefined) ?? "";
}

export function hasToken(): boolean {
  return !!getToken();
}

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("VITE_MONDAY_API_TOKEN is not set");
  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": MONDAY_API_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("Monday API HTTP error", { status: res.status, body });
    throw new Error(`Monday request failed (${res.status})`);
  }
  const json = await res.json();
  if (json.errors) {
    console.error("Monday API GraphQL error", json.errors);
    throw new Error(json.errors.map((e: { message: string }) => e.message).join("; "));
  }
  return json.data as T;
}

export async function fetchGroupItems(groupId: string = GROUPS.intake): Promise<MondayItem[]> {
  const query = `
    query ($boardId: ID!, $cols: [String!]) {
      boards(ids: [$boardId]) {
        items_page(limit: 100, query_params: { rules: [{ column_id: "group", compare_value: ${JSON.stringify([groupId])} }] }) {
          items {
            id
            name
            column_values(ids: $cols) { id text value }
          }
        }
      }
    }
  `;
  const data = await gql<{ boards: { items_page: { items: MondayItem[] } }[] }>(query, {
    boardId: BOARD_ID,
    cols: READ_COLUMN_IDS,
  });
  return data.boards?.[0]?.items_page?.items ?? [];
}

/**
 * Write a status column by index.
 */
export async function writeStatusIndex(itemId: string, columnId: string, index: number): Promise<void> {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) { id }
    }
  `;
  await gql(query, {
    boardId: BOARD_ID,
    itemId,
    columnId,
    value: JSON.stringify({ index }),
  });
}

/**
 * Write a text column.
 */
export async function writeText(itemId: string, columnId: string, text: string): Promise<void> {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) { id }
    }
  `;
  await gql(query, {
    boardId: BOARD_ID,
    itemId,
    columnId,
    value: JSON.stringify(text),
  });
}

/**
 * Write a long_text column.
 */
export async function writeLongText(itemId: string, columnId: string, text: string): Promise<void> {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) { id }
    }
  `;
  await gql(query, {
    boardId: BOARD_ID,
    itemId,
    columnId,
    value: JSON.stringify({ text }),
  });
}

/**
 * Write a dropdown column (multi-select) by option ids.
 */
export async function writeDropdownIds(itemId: string, columnId: string, ids: number[]): Promise<void> {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) { id }
    }
  `;
  await gql(query, {
    boardId: BOARD_ID,
    itemId,
    columnId,
    value: JSON.stringify({ ids }),
  });
}

/**
 * Write a phone column.
 */
export async function writePhone(itemId: string, columnId: string, phone: string, countryShortName = "US"): Promise<void> {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) { id }
    }
  `;
  await gql(query, {
    boardId: BOARD_ID,
    itemId,
    columnId,
    value: JSON.stringify({ phone, countryShortName }),
  });
}

/**
 * Write an email column.
 */
export async function writeEmail(itemId: string, columnId: string, email: string, text?: string): Promise<void> {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) { id }
    }
  `;
  await gql(query, {
    boardId: BOARD_ID,
    itemId,
    columnId,
    value: JSON.stringify({ email, text: text ?? email }),
  });
}
