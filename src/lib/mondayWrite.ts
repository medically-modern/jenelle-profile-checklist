/**
 * Real-time write helpers — fire individual column mutations on user change.
 */
import { writeStatusIndex, writeText, writePhone, writeEmail, COL } from "./mondayApi";

/**
 * Write a status column given the column key from COL, the label text,
 * and a label→index lookup map.
 */
export async function writeStatus(
  itemId: string,
  columnId: string,
  label: string,
  indexMap: Record<string, number>,
): Promise<void> {
  const index = indexMap[label];
  if (index === undefined) {
    console.warn(`writeStatus: unknown label "${label}" for column ${columnId}`);
    return;
  }
  await writeStatusIndex(itemId, columnId, index);
}

/**
 * Write a plain text column.
 */
export async function writeTextField(itemId: string, columnId: string, value: string): Promise<void> {
  await writeText(itemId, columnId, value);
}

/**
 * Write a phone column.
 */
export async function writePhoneField(itemId: string, columnId: string, phone: string): Promise<void> {
  await writePhone(itemId, columnId, phone);
}

/**
 * Write an email column.
 */
export async function writeEmailField(itemId: string, columnId: string, email: string): Promise<void> {
  await writeEmail(itemId, columnId, email);
}

/**
 * Trigger a Stedi eligibility run by setting the status to "Run" (index 1).
 */
export async function triggerStediRun(itemId: string): Promise<void> {
  await writeStatusIndex(itemId, COL.runStediEligibility, 1);
}
