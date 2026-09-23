import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  boolean,
  numeric,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const userRoleEnum = pgEnum("user_role", ["student", "teacher", "admin", "staff"]);

export const userCategoryEnum = pgEnum("user_category", ["student", "teacher", "staff"]);

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "processing",
  "ready",
  "claimed",
  "cancelled",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), 
  studentId: text("student_id").unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  ...timestamps,
});

export const documentTypes = pgTable("document_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: userCategoryEnum("user_category").notNull().default("student"),
  description: text("description"),
  fee: numeric("fee", { precision: 10, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  requiredFields: jsonb("required_fields").notNull().default("[]"),
  ...timestamps,
});

export const documentRequests = pgTable("document_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")            // FK type must match referenced PK type
    .references(() => users.id)
    .notNull(),
  documentTypeId: uuid("document_type_id")
    .references(() => documentTypes.id)
    .notNull(),
  purpose: text("purpose"),
  formData: jsonb("form_data").notNull().default("{}"),
  status: requestStatusEnum("status").notNull().default("pending"),
  releaseDate: date("release_date"),
  claimedAt: timestamp("claimed_at"),
  staffNotes: text("staff_notes"),
  ...timestamps,
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .references(() => documentRequests.id)
    .notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  receiptNumber: text("receipt_number").notNull().unique(),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
  ...timestamps,
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  requestId: uuid("request_id").references(() => documentRequests.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  ...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
  documentRequests: many(documentRequests),
  notifications: many(notifications),
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
    }),
    documentType: one(documentTypes, {
      fields: [documentRequests.documentTypeId],
      references: [documentTypes.id],
    }),
    payments: many(payments),
    notifications: many(notifications),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  request: one(documentRequests, {
    fields: [payments.requestId],
    references: [documentRequests.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  request: one(documentRequests, {
    fields: [notifications.requestId],
    references: [documentRequests.id],
  }),
}));
