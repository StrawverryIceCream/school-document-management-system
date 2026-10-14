import {
  pgTable,
  pgEnum,
  pgSequence,
  uuid,
  text,
  integer,
  timestamp,
  date,
  boolean,
  numeric,
  jsonb,
  check,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

const tz = (name: string) => timestamp(name, { withTimezone: true });

const timestamps = {
  createdAt: tz("created_at").notNull().defaultNow(),
  updatedAt: tz("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export type RequiredField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "file";
  required: boolean;
  options?: string[];
};

/* -------------------------------------------------------------------------- */
/*  Sequences (human-readable numbers)                                        */
/* -------------------------------------------------------------------------- */

export const requestRefSeq = pgSequence("request_ref_seq");
export const receiptNumberSeq = pgSequence("receipt_number_seq");

/* -------------------------------------------------------------------------- */
/*  Enums                                                                     */
/* -------------------------------------------------------------------------- */

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "teacher",
  "admin",
  "staff",
]);

export const userCategoryEnum = pgEnum("user_category", [
  "student",
  "teacher",
  "staff",
]);

export const officeEnum = pgEnum("office", ["registrar", "hr"]);

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "awaiting_payment",
  "processing",
  "on_hold",
  "ready",
  "claimed",
  "rejected",
  "cancelled",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "verified",
  "rejected",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "e_wallet",
  "card",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "status_update",
  "payment",
  "appointment",
  "announcement",
  "system",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "booked",
  "completed",
  "no_show",
  "cancelled",
]);

/* -------------------------------------------------------------------------- */
/*  Organization: colleges, courses                                           */
/* -------------------------------------------------------------------------- */

export const colleges = pgTable("colleges", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collegeId: uuid("college_id")
      .references(() => colleges.id)
      .notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("courses_college_code_uniq").on(table.collegeId, table.code),
    index("courses_college_id_idx").on(table.collegeId),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Users                                                                     */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: text("student_id").unique(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("student"),
    isActive: boolean("is_active").notNull().default(true),
    contactNumber: text("contact_number"),
    collegeId: uuid("college_id").references(() => colleges.id),
    courseId: uuid("course_id").references(() => courses.id),
    section: text("section"),
    yearLevel: integer("year_level"),
    department: text("department"),
    // Which office a staff member works for (registrar or HR)
    office: officeEnum("office"),
    emailVerifiedAt: tz("email_verified_at"),
    lastLoginAt: tz("last_login_at"),
    ...timestamps,
  },
  (table) => [
    // College and course placement only apply to students and admins
    check(
      "users_college_allowed_roles",
      sql`${table.collegeId} IS NULL OR ${table.role} IN ('student', 'admin')`,
    ),
    check(
      "users_course_allowed_roles",
      sql`${table.courseId} IS NULL OR ${table.role} IN ('student', 'admin')`,
    ),
    // A section only makes sense inside a course
    check(
      "users_section_requires_course",
      sql`${table.section} IS NULL OR ${table.courseId} IS NOT NULL`,
    ),
    check(
      "users_section_allowed_roles",
      sql`${table.section} IS NULL OR ${table.role} IN ('student', 'admin')`,
    ),
    check(
      "users_year_level_students_only",
      sql`${table.yearLevel} IS NULL OR (${table.role} = 'student' AND ${table.yearLevel} BETWEEN 1 AND 6)`,
    ),
    // Departments belong to teachers and admins
    check(
      "users_department_allowed_roles",
      sql`${table.department} IS NULL OR ${table.role} IN ('teacher', 'admin')`,
    ),
    // Staff must belong to an office; only staff and admins can have one
    check(
      "users_office_allowed_roles",
      sql`${table.office} IS NULL OR ${table.role} IN ('staff', 'admin')`,
    ),
    check(
      "users_staff_requires_office",
      sql`${table.role} <> 'staff' OR ${table.office} IS NOT NULL`,
    ),
    index("users_role_idx").on(table.role),
    index("users_course_id_idx").on(table.courseId),
  ],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: tz("expires_at").notNull(),
    usedAt: tz("used_at"),
    createdAt: tz("created_at").notNull().defaultNow(),
  },
  (table) => [index("password_reset_tokens_user_id_idx").on(table.userId)],
);

/* -------------------------------------------------------------------------- */
/*  Windows (service counters) and staff assignment                           */
/* -------------------------------------------------------------------------- */

export const windows = pgTable(
  "windows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    office: officeEnum("office").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("windows_office_name_uniq").on(table.office, table.name),
  ],
);

export const staffWindows = pgTable(
  "staff_windows",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    windowId: uuid("window_id")
      .references(() => windows.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.windowId] }),
    index("staff_windows_window_id_idx").on(table.windowId),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Document types                                                            */
/* -------------------------------------------------------------------------- */

export const documentTypes = pgTable(
  "document_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    // Who may request it. Column renamed from "user_category" to "category".
    category: userCategoryEnum("category").notNull().default("student"),
    // Which office processes it
    office: officeEnum("office").notNull().default("registrar"),
    description: text("description"),
    // Shown to the requester before they submit
    instructions: text("instructions"),
    // fee = 0 means free, so no separate requiresPayment flag
    fee: numeric("fee", { precision: 10, scale: 2 }).notNull().default("0"),
    processingDays: integer("processing_days").notNull().default(3),
    maxCopies: integer("max_copies").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    requiredFields: jsonb("required_fields")
      .$type<RequiredField[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    ...timestamps,
  },
  (table) => [
    check("document_types_fee_nonneg", sql`${table.fee} >= 0`),
    check(
      "document_types_processing_days_nonneg",
      sql`${table.processingDays} >= 0`,
    ),
    check("document_types_max_copies_min", sql`${table.maxCopies} >= 1`),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Document requests                                                         */
/* -------------------------------------------------------------------------- */

export const documentRequests = pgTable(
  "document_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // e.g. REQ-2026-000123. Generated by the DB, quoted by students at the window.
    referenceNumber: text("reference_number")
      .notNull()
      .unique()
      .default(
        sql`'REQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('request_ref_seq')::text, 6, '0')`,
      ),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    documentTypeId: uuid("document_type_id")
      .references(() => documentTypes.id)
      .notNull(),

    // Snapshots taken at submission so later edits to the document type
    // (rename, fee change, new turnaround) never rewrite request history.
    // The API must populate these on insert.
    documentTypeCode: text("document_type_code").notNull(),
    documentTypeName: text("document_type_name").notNull(),
    amountDue: numeric("amount_due", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    turnaroundDays: integer("turnaround_days").notNull().default(0),

    copies: integer("copies").notNull().default(1),
    purpose: text("purpose"),
    formData: jsonb("form_data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    status: requestStatusEnum("status").notNull().default("pending"),

    // Staff handling
    windowId: uuid("window_id").references(() => windows.id),
    assignedTo: uuid("assigned_to_id").references(() => users.id),
    processedAt: tz("processed_at"),
    readyAt: tz("ready_at"),
    releaseDate: date("release_date"),

    // Claiming
    claimedAt: tz("claimed_at"),
    claimedBy: text("claimed_by"), // name of the person who picked it up
    releasedBy: uuid("released_by_id").references(() => users.id),

    // Cancellation
    cancelledAt: tz("cancelled_at"),
    cancellationReason: text("cancellation_reason"),

    // internalNotes: staff only. remarks: visible to the requester.
    internalNotes: text("internal_notes"),
    remarks: text("remarks"),
    ...timestamps,
  },
  (table) => [
    check("document_requests_copies_min", sql`${table.copies} >= 1`),
    check("document_requests_amount_nonneg", sql`${table.amountDue} >= 0`),
    check(
      "document_requests_ready_requires_release_date",
      sql`${table.status} NOT IN ('ready', 'claimed') OR ${table.releaseDate} IS NOT NULL`,
    ),
    check(
      "document_requests_claimed_requires_claimed_at",
      sql`${table.status} <> 'claimed' OR ${table.claimedAt} IS NOT NULL`,
    ),
    check(
      "document_requests_cancelled_requires_cancelled_at",
      sql`${table.status} <> 'cancelled' OR ${table.cancelledAt} IS NOT NULL`,
    ),
    // Staff queue: filter by status, newest first
    index("document_requests_status_created_idx").on(
      table.status,
      table.createdAt,
    ),
    index("document_requests_user_id_idx").on(table.userId),
    index("document_requests_document_type_id_idx").on(table.documentTypeId),
    index("document_requests_window_id_idx").on(table.windowId),
    index("document_requests_assigned_to_idx").on(table.assignedTo),
  ],
);

export const requestStatusHistory = pgTable(
  "request_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .references(() => documentRequests.id)
      .notNull(),
    fromStatus: requestStatusEnum("from_status"), // NULL on creation
    toStatus: requestStatusEnum("to_status").notNull(),
    // NULL means the system changed it
    changedBy: uuid("changed_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: tz("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("request_status_history_request_idx").on(
      table.requestId,
      table.createdAt,
    ),
  ],
);

export const requestAttachments = pgTable(
  "request_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .references(() => documentRequests.id)
      .notNull(),
    uploadedBy: uuid("uploaded_by_id")
      .references(() => users.id)
      .notNull(),
    label: text("label"), // matches a `file` key in documentTypes.requiredFields
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    createdAt: tz("created_at").notNull().defaultNow(),
  },
  (table) => [index("request_attachments_request_idx").on(table.requestId)],
);

/* -------------------------------------------------------------------------- */
/*  Payments                                                                  */
/* -------------------------------------------------------------------------- */

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .references(() => documentRequests.id)
      .notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    method: paymentMethodEnum("method").notNull(),
    // Transaction ID the payer entered; staff match it against statements
    referenceNumber: text("reference_number"),
    paymentProofUrl: text("payment_proof_url"),
    status: paymentStatus("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    submittedAt: tz("submitted_at").notNull().defaultNow(),
    // Set on both verify and reject
    reviewedBy: uuid("reviewed_by_id").references(() => users.id),
    reviewedAt: tz("reviewed_at"),
    receiptNumber: text("receipt_number").unique(),
    ...timestamps,
  },
  (table) => [
    check("payments_amount_positive", sql`${table.amount} > 0`),
    check(
      "payments_verified_requires_reviewer_and_receipt",
      sql`${table.status} <> 'verified' OR (${table.reviewedBy} IS NOT NULL AND ${table.reviewedAt} IS NOT NULL AND ${table.receiptNumber} IS NOT NULL)`,
    ),
    check(
      "payments_rejected_requires_reviewer_and_reason",
      sql`${table.status} <> 'rejected' OR (${table.reviewedBy} IS NOT NULL AND ${table.reviewedAt} IS NOT NULL AND ${table.rejectionReason} IS NOT NULL)`,
    ),
    // One live payment per request. Rejected rows can pile up for resubmissions.
    uniqueIndex("payments_one_active_per_request")
      .on(table.requestId)
      .where(sql`${table.status} IN ('pending', 'verified')`),
    index("payments_request_id_idx").on(table.requestId),
    index("payments_status_idx").on(table.status),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Appointments                                                              */
/* -------------------------------------------------------------------------- */

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    windowId: uuid("window_id")
      .references(() => windows.id)
      .notNull(),
    requestId: uuid("request_id").references(() => documentRequests.id),
    purpose: text("purpose"),
    scheduledAt: tz("scheduled_at").notNull(),
    status: appointmentStatusEnum("status").notNull().default("booked"),
    ...timestamps,
  },
  (table) => [
    // No double-booking a window slot
    uniqueIndex("appointments_window_slot_uniq")
      .on(table.windowId, table.scheduledAt)
      .where(sql`${table.status} = 'booked'`),
    index("appointments_user_id_idx").on(table.userId),
    index("appointments_window_scheduled_idx").on(
      table.windowId,
      table.scheduledAt,
    ),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Notifications and announcements                                           */
/* -------------------------------------------------------------------------- */

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    // NULL means the system sent it (e.g. automatic status updates)
    senderId: uuid("sender_id").references(() => users.id, {
      onDelete: "set null",
    }),
    requestId: uuid("request_id").references(() => documentRequests.id),
    type: notificationTypeEnum("type").notNull().default("system"),
    title: text("title").notNull().default("Notification"),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    readAt: tz("read_at"),
    emailSentAt: tz("email_sent_at"),
    ...timestamps,
  },
  (table) => [
    // Bell icon query: a user's unread notifications, newest first
    index("notifications_user_unread_idx").on(
      table.userId,
      table.isRead,
      table.createdAt,
    ),
  ],
);

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    // NULL means everyone
    audience: userCategoryEnum("audience"),
    isPinned: boolean("is_pinned").notNull().default(false),
    publishedAt: tz("published_at"),
    expiresAt: tz("expires_at"),
    createdBy: uuid("created_by_id")
      .references(() => users.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [
    check(
      "announcements_expiry_after_publish",
      sql`${table.expiresAt} IS NULL OR ${table.publishedAt} IS NULL OR ${table.expiresAt} > ${table.publishedAt}`,
    ),
    index("announcements_published_idx").on(table.publishedAt),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Audit log                                                                 */
/* -------------------------------------------------------------------------- */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // NULL means the system acted
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(), // e.g. "payment.verified", "request.status_changed"
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ipAddress: text("ip_address"),
    createdAt: tz("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_created_at_idx").on(table.createdAt),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_actor_idx").on(table.actorId),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Relations                                                                 */
/* -------------------------------------------------------------------------- */

export const collegesRelations = relations(colleges, ({ many }) => ({
  courses: many(courses),
  users: many(users),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  college: one(colleges, {
    fields: [courses.collegeId],
    references: [colleges.id],
  }),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  college: one(colleges, {
    fields: [users.collegeId],
    references: [colleges.id],
  }),
  course: one(courses, {
    fields: [users.courseId],
    references: [courses.id],
  }),
  documentRequests: many(documentRequests, {
    relationName: "request_owner",
  }),
  assignedRequests: many(documentRequests, {
    relationName: "request_assignee",
  }),
  releasedRequests: many(documentRequests, {
    relationName: "request_releaser",
  }),
  reviewedPayments: many(payments, { relationName: "payment_reviewer" }),
  receivedNotifications: many(notifications, {
    relationName: "notification_recipient",
  }),
  sentNotifications: many(notifications, {
    relationName: "notification_sender",
  }),
  appointments: many(appointments),
  staffWindows: many(staffWindows),
  passwordResetTokens: many(passwordResetTokens),
}));

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  }),
);

export const windowsRelations = relations(windows, ({ many }) => ({
  staffWindows: many(staffWindows),
  requests: many(documentRequests),
  appointments: many(appointments),
}));

export const staffWindowsRelations = relations(staffWindows, ({ one }) => ({
  user: one(users, {
    fields: [staffWindows.userId],
    references: [users.id],
  }),
  window: one(windows, {
    fields: [staffWindows.windowId],
    references: [windows.id],
  }),
}));

export const documentTypesRelations = relations(documentTypes, ({ many }) => ({
  requests: many(documentRequests),
}));

export const documentRequestsRelations = relations(
  documentRequests,
  ({ one, many }) => ({
    user: one(users, {
      fields: [documentRequests.userId],
      references: [users.id],
      relationName: "request_owner",
    }),
    assignee: one(users, {
      fields: [documentRequests.assignedTo],
      references: [users.id],
      relationName: "request_assignee",
    }),
    releaser: one(users, {
      fields: [documentRequests.releasedBy],
      references: [users.id],
      relationName: "request_releaser",
    }),
    documentType: one(documentTypes, {
      fields: [documentRequests.documentTypeId],
      references: [documentTypes.id],
    }),
    window: one(windows, {
      fields: [documentRequests.windowId],
      references: [windows.id],
    }),
    payments: many(payments),
    notifications: many(notifications),
    statusHistory: many(requestStatusHistory),
    attachments: many(requestAttachments),
    appointments: many(appointments),
  }),
);

export const requestStatusHistoryRelations = relations(
  requestStatusHistory,
  ({ one }) => ({
    request: one(documentRequests, {
      fields: [requestStatusHistory.requestId],
      references: [documentRequests.id],
    }),
    changedByUser: one(users, {
      fields: [requestStatusHistory.changedBy],
      references: [users.id],
    }),
  }),
);

export const requestAttachmentsRelations = relations(
  requestAttachments,
  ({ one }) => ({
    request: one(documentRequests, {
      fields: [requestAttachments.requestId],
      references: [documentRequests.id],
    }),
    uploader: one(users, {
      fields: [requestAttachments.uploadedBy],
      references: [users.id],
    }),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  request: one(documentRequests, {
    fields: [payments.requestId],
    references: [documentRequests.id],
  }),
  reviewer: one(users, {
    fields: [payments.reviewedBy],
    references: [users.id],
    relationName: "payment_reviewer",
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  window: one(windows, {
    fields: [appointments.windowId],
    references: [windows.id],
  }),
  request: one(documentRequests, {
    fields: [appointments.requestId],
    references: [documentRequests.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "notification_recipient",
  }),
  sender: one(users, {
    fields: [notifications.senderId],
    references: [users.id],
    relationName: "notification_sender",
  }),
  request: one(documentRequests, {
    fields: [notifications.requestId],
    references: [documentRequests.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));