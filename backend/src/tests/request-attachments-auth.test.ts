import assert from "node:assert";

interface AttachmentAuthContext {
  userId: string;
  userRole: "admin" | "staff" | "teacher" | "student";
}

interface MockAttachment {
  id: string;
  requestId: string;
  requestOwnerId: string;
  uploadedBy: string;
}

export function canAccessAttachment(
  ctx: AttachmentAuthContext,
  attachment: MockAttachment,
): boolean {
  if (ctx.userRole === "admin" || ctx.userRole === "staff") return true;
  return attachment.requestOwnerId === ctx.userId || attachment.uploadedBy === ctx.userId;
}

export function canDeleteAttachment(
  ctx: AttachmentAuthContext,
  attachment: MockAttachment,
): boolean {
  if (ctx.userRole === "admin") return true;
  return attachment.uploadedBy === ctx.userId;
}

console.log("Running request attachment authorization tests...");

const studentA: AttachmentAuthContext = { userId: "user-1", userRole: "student" };
const studentB: AttachmentAuthContext = { userId: "user-2", userRole: "student" };
const staff: AttachmentAuthContext = { userId: "staff-1", userRole: "staff" };

const attachmentA: MockAttachment = {
  id: "att-1",
  requestId: "req-1",
  requestOwnerId: "user-1",
  uploadedBy: "user-1",
};

assert.strictEqual(canAccessAttachment(studentA, attachmentA), true);
assert.strictEqual(canAccessAttachment(studentB, attachmentA), false, "Student B must NOT access Student A attachment");
assert.strictEqual(canAccessAttachment(staff, attachmentA), true, "Staff must access student attachment");
assert.strictEqual(canDeleteAttachment(studentB, attachmentA), false, "Student B must NOT delete Student A attachment");
assert.strictEqual(canDeleteAttachment(studentA, attachmentA), true, "Owner can delete their own attachment");

console.log("All request attachment authorization tests passed!");
