/* -------------------------------------------------------------------------- */
/*  Wire-format aliases                                                       */
/*  JSON has no Date or numeric type: timestamps arrive as ISO strings and    */
/*  numeric(10,2) columns arrive as strings.                                  */
/* -------------------------------------------------------------------------- */

export type UUID = string;
/** Full timestamp, e.g. "2026-10-15T08:30:00.000Z" */
export type ISODateTimeString = string;
/** Calendar date only, e.g. "2026-10-20" */
export type ISODateString = string;
/** e.g. "150.00". Convert with Number() at render time, not in state. */
export type DecimalString = string;

/* -------------------------------------------------------------------------- */
/*  Enums (mirror the pgEnum definitions in backend schema.ts)                */
/* -------------------------------------------------------------------------- */

export const userRoles = ["student", "teacher", "admin", "staff"] as const;
export type UserRole = (typeof userRoles)[number];

export const studentStatuses = [
  "regular",
  "irregular",
  "graduating",
  "alumni",
] as const;
export type StudentStatus = (typeof studentStatuses)[number];

export const userCategories = ["student", "teacher", "staff"] as const;
export type UserCategory = (typeof userCategories)[number];

export const offices = ["registrar", "hr"] as const;
export type Office = (typeof offices)[number];

export const requestStatuses = [
  "pending",
  "awaiting_payment",
  "processing",
  "on_hold",
  "ready",
  "claimed",
  "rejected",
  "cancelled",
] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const paymentStatuses = ["pending", "verified", "rejected"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const paymentMethods = [
  "bank_transfer",
  "e_wallet",
  "card",
  "cash",
] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const notificationTypes = [
  "status_update",
  "payment",
  "appointment",
  "announcement",
  "system",
] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const appointmentStatuses = [
  "booked",
  "completed",
  "no_show",
  "cancelled",
] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export const formFieldTypes = [
  "text",
  "textarea",
  "number",
  "date",
  "select",
  "checkbox",
  "file",
] as const;
export type FormFieldType = (typeof formFieldTypes)[number];

/* -------------------------------------------------------------------------- */
/*  UI labels and groupings (colors live in lib/tones.ts)                     */
/* -------------------------------------------------------------------------- */

export const roleLabels: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
  staff: "Staff",
};

export const officeLabels: Record<Office, string> = {
  registrar: "Registrar",
  hr: "Human Resources",
};

export const requestStatusLabels: Record<RequestStatus, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  processing: "Processing",
  on_hold: "On Hold",
  ready: "Ready for Pickup",
  claimed: "Claimed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending Review",
  verified: "Verified",
  rejected: "Rejected",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  e_wallet: "E-Wallet",
  card: "Card",
  cash: "Cash",
};

export const notificationTypeLabels: Record<NotificationType, string> = {
  status_update: "Status Update",
  payment: "Payment",
  appointment: "Appointment",
  announcement: "Announcement",
  system: "System",
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  booked: "Booked",
  completed: "Completed",
  no_show: "No Show",
  cancelled: "Cancelled",
};

/** Statuses after which a request can no longer change. */
export const terminalRequestStatuses: readonly RequestStatus[] = [
  "claimed",
  "rejected",
  "cancelled",
];

/** Statuses that belong in a staff member's working queue. */
export const openRequestStatuses: readonly RequestStatus[] = [
  "pending",
  "awaiting_payment",
  "processing",
  "on_hold",
  "ready",
];

/* -------------------------------------------------------------------------- */
/*  Shared                                                                    */
/* -------------------------------------------------------------------------- */

export interface Timestamps {
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface ApiError {
  error: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/* -------------------------------------------------------------------------- */
/*  Organization                                                              */
/* -------------------------------------------------------------------------- */

export interface College extends Timestamps {
  id: UUID;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Course extends Timestamps {
  id: UUID;
  collegeId: UUID;
  code: string;
  name: string;
  isActive: boolean;
}

export interface CollegeWithCourses extends College {
  courses: Course[];
}

/* -------------------------------------------------------------------------- */
/*  Users (passwordHash never leaves the server)                              */
/* -------------------------------------------------------------------------- */

export interface User extends Timestamps {
  id: UUID;
  studentId: string | null;
  fullName: string;
  email: string;
  role: UserRole;
  studentStatus: StudentStatus | null;
  isActive: boolean;
  contactNumber: string | null;
  collegeId: UUID | null;
  courseId: UUID | null;
  section: string | null;
  yearLevel: number | null;
  department: string | null;
  office: Office | null;
  officeId: UUID | null;
  emailVerifiedAt: ISODateTimeString | null;
  lastLoginAt: ISODateTimeString | null;
}

export type AuthUser = Omit<User, "createdAt" | "updatedAt">;

/** User with college and course resolved, for profile and accounts pages. */
export interface UserWithOrg extends User {
  college: College | null;
  course: Course | null;
}

/** Minimal user shape embedded in other records (requester, assignee, reviewer). */
export type UserSummary = Pick<
  User,
  "id" | "fullName" | "email" | "role" | "studentId" | "department" | "office"
> & {
  college?: { id: string; code: string; name: string } | null;
  course?: { id: string; code: string; name: string } | null;
};

/** Requester summary with the college identity returned by staff request APIs. */
export interface RequesterSummary extends UserSummary {
  collegeId: UUID | null;
  college: Pick<College, "id" | "code" | "name"> | null;
  department: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Service windows                                                           */
/*  Named ServiceWindow to avoid shadowing the DOM global `Window`.           */
/* -------------------------------------------------------------------------- */

export interface ServiceWindow extends Timestamps {
  id: UUID;
  name: string;
  office: Office;
  isActive: boolean;
}

export interface ServiceWindowWithStaff extends ServiceWindow {
  staff: UserSummary[];
}

/* -------------------------------------------------------------------------- */
/*  Document types                                                            */
/* -------------------------------------------------------------------------- */

export interface RequiredFieldDefinition {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

export type RequiredFieldValues = Record<string, string | number | boolean>;

export interface DocumentType extends Timestamps {
  id: UUID;
  code: string;
  name: string;
  officeId?: UUID | null;
  officeRecord?: {
    id: string;
    code: string;
    name: string;
    sector: string;
  } | null;
  category: UserCategory;
  allowedCategories?: string[] | null;
  allowedStudentStatuses?: string[] | null;
  office: Office;
  description: string | null;
  instructions: string | null;
  fee: DecimalString;
  processingDays: number;
  maxCopies: number;
  isActive: boolean;
  sortOrder: number;
  requiredFields: RequiredFieldDefinition[];
}

export interface NewDocument {
  code: string;
  name: string;
  description: string;
  fee: DecimalString;
  isActive: boolean;
  requiredFields: RequiredFieldDefinition[];
  category?: UserCategory;
  office?: Office;
  instructions?: string | null;
  processingDays?: number;
  maxCopies?: number;
  sortOrder?: number;
}

export type UpdateDocumentTypeInput = Partial<NewDocument>;

/* -------------------------------------------------------------------------- */
/*  Document requests                                                         */
/* -------------------------------------------------------------------------- */

export interface DocumentRequest extends Timestamps {
  id: UUID;
  /** Human-readable, e.g. "REQ-2026-000123" */
  referenceNumber: string;
  userId: UUID;
  documentTypeId: UUID;

  // Snapshots captured at submission time
  documentTypeCode: string;
  documentTypeName: string;
  amountDue: DecimalString;
  turnaroundDays: number;

  copies: number;
  purpose: string | null;
  formData: Record<string, unknown>;
  status: RequestStatus;

  // Staff handling
  windowId: UUID | null;
  assignedTo: UUID | null;
  processedAt: ISODateTimeString | null;
  readyAt: ISODateTimeString | null;
  releaseDate: ISODateString | null;
  releasePdfUrl: string | null;

  // Claiming
  claimedAt: ISODateTimeString | null;
  claimedBy: string | null;
  releasedBy: UUID | null;

  // Cancellation
  cancelledAt: ISODateTimeString | null;
  cancellationReason: string | null;

  /** Staff only. The API must strip this from student-facing responses. */
  internalNotes: string | null;
  /** Visible to the requester. */
  remarks: string | null;

  /** Frontend-only. Not a column in the schema. */
  tags?: string[];
}

export interface RequestStatusHistory {
  id: UUID;
  requestId: UUID;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  /** null means the system made the change */
  changedBy: UUID | null;
  note: string | null;
  createdAt: ISODateTimeString;
  changedByUser?: UserSummary | null;
}

export interface RequestAttachment {
  id: UUID;
  requestId: UUID;
  uploadedBy: UUID;
  /** Matches a `file` field key in DocumentType.requiredFields */
  label: string | null;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: ISODateTimeString;
  uploader?: UserSummary;
}

export interface Payment extends Timestamps {
  id: UUID;
  requestId: UUID;
  amount: DecimalString;
  method: PaymentMethod;
  /** Transaction ID entered by the payer */
  referenceNumber: string | null;
  paymentProofUrl: string | null;
  status: PaymentStatus;
  rejectionReason: string | null;
  submittedAt: ISODateTimeString;
  reviewedBy: UUID | null;
  reviewedAt: ISODateTimeString | null;
  receiptNumber: string | null;
  reviewer?: UserSummary | null;
}

/**
 * A request has many payments because rejected ones stay for resubmissions.
 * At most one is pending or verified at any time.
 */
export interface DocumentRequestWithRelations extends DocumentRequest {
  user?: RequesterSummary;
  documentType?: DocumentType;
  window?: ServiceWindow | null;
  assignee?: UserSummary | null;
  releaser?: UserSummary | null;
  payments?: Payment[];
  statusHistory?: RequestStatusHistory[];
  attachments?: RequestAttachment[];
}

/** Every relation loaded, for the request detail page. */
export interface DocumentRequestDetail extends DocumentRequest {
  user: RequesterSummary;
  documentType: DocumentType;
  window: ServiceWindow | null;
  assignee: UserSummary | null;
  releaser: UserSummary | null;
  payments: Payment[];
  statusHistory: RequestStatusHistory[];
  attachments: RequestAttachment[];
}

/** Only what list and queue tables need. */
export interface DocumentRequestListItem extends DocumentRequest {
  user: RequesterSummary;
  window: ServiceWindow | null;
  assignee: UserSummary | null;
}

/* -------------------------------------------------------------------------- */
/*  Appointments                                                              */
/* -------------------------------------------------------------------------- */

export interface Appointment extends Timestamps {
  id: UUID;
  userId: UUID;
  windowId: UUID;
  requestId: UUID | null;
  purpose: string | null;
  scheduledAt: ISODateTimeString;
  status: AppointmentStatus;
  user?: UserSummary;
  window?: ServiceWindow;
  request?: Pick<
    DocumentRequest,
    "id" | "referenceNumber" | "documentTypeName" | "status"
  > | null;
}

/* -------------------------------------------------------------------------- */
/*  Notifications and announcements                                           */
/*  Named AppNotification to avoid shadowing the DOM global `Notification`.   */
/* -------------------------------------------------------------------------- */

export interface AppNotification extends Timestamps {
  id: UUID;
  userId: UUID;
  /** null means the system sent it */
  senderId: UUID | null;
  requestId: UUID | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: ISODateTimeString | null;
  emailSentAt: ISODateTimeString | null;
  sender?: UserSummary | null;
}

export interface Announcement extends Timestamps {
  id: UUID;
  title: string;
  body: string;
  /** null means everyone */
  audience: UserCategory | null;
  isPinned: boolean;
  publishedAt: ISODateTimeString | null;
  expiresAt: ISODateTimeString | null;
  createdBy: UUID;
  author?: UserSummary;
}

/* -------------------------------------------------------------------------- */
/*  Audit log                                                                 */
/* -------------------------------------------------------------------------- */

export interface AuditLog {
  id: UUID;
  /** null means the system acted */
  actorId: UUID | null;
  /** e.g. "payment.verified", "request.status_changed" */
  action: string;
  entityType: string;
  entityId: UUID | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: ISODateTimeString;
  actor?: UserSummary | null;
}

/* -------------------------------------------------------------------------- */
/*  Inputs: auth and accounts                                                 */
/* -------------------------------------------------------------------------- */

export interface LoginInput {
  email: string;
  password: string;
}

interface BaseSignupInput {
  fullName: string;
  email: string;
  password: string;
  contactNumber?: string;
}

export interface StudentSignupInput extends BaseSignupInput {
  role: "student";
  studentId?: string;
  collegeId: UUID;
  courseId: UUID;
  section?: string;
  yearLevel?: number;
}

export interface TeacherSignupInput extends BaseSignupInput {
  role: "teacher";
  department: string;
}

/** Discriminated on `role`: students send college and course, teachers send a department. */
export type SignupInput = StudentSignupInput | TeacherSignupInput;

export interface UpdateProfileInput {
  fullName?: string;
  contactNumber?: string | null;
  section?: string | null;
  yearLevel?: number | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/** Admin account management. */
export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string | null;
  contactNumber?: string | null;
  collegeId?: UUID | null;
  courseId?: UUID | null;
  section?: string | null;
  yearLevel?: number | null;
  department?: string | null;
  office?: Office | null;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, "password">> & {
  password?: string;
  isActive?: boolean;
};

/* -------------------------------------------------------------------------- */
/*  Inputs: configuration (admin)                                             */
/* -------------------------------------------------------------------------- */

export type CreateCollegeInput = Pick<College, "code" | "name"> &
  Partial<Pick<College, "isActive">>;
export type UpdateCollegeInput = Partial<CreateCollegeInput>;

export type CreateCourseInput = Pick<Course, "collegeId" | "code" | "name"> &
  Partial<Pick<Course, "isActive">>;
export type UpdateCourseInput = Partial<CreateCourseInput>;

export type CreateServiceWindowInput = Pick<ServiceWindow, "name" | "office"> &
  Partial<Pick<ServiceWindow, "isActive">>;
export type UpdateServiceWindowInput = Partial<CreateServiceWindowInput>;

export interface SetWindowStaffInput {
  userIds: UUID[];
}

/* -------------------------------------------------------------------------- */
/*  Inputs: requests and payments                                             */
/* -------------------------------------------------------------------------- */

export interface CreateDocumentRequestInput {
  documentTypeId: UUID;
  copies: number;
  purpose?: string;
  formData: Record<string, unknown>;
}

/** Uploads for `file` fields go through multipart, keyed by RequiredFieldDefinition.key. */
export interface UploadRequestAttachmentInput {
  requestId: UUID;
  label: string;
  file: File;
}

export interface CancelRequestInput {
  reason: string;
}

export interface SubmitPaymentInput {
  requestId: UUID;
  method: PaymentMethod;
  referenceNumber?: string;
  proofFile: File;
}

/** Staff action on a submitted payment. Rejecting requires a reason. */
export type ReviewPaymentInput =
  | { decision: "verified" }
  | { decision: "rejected"; rejectionReason: string };

/** Staff action on a request. releaseDate is required when moving to ready. */
export interface UpdateRequestStatusInput {
  status: RequestStatus;
  /** Written to the status history entry */
  note?: string;
  /** Visible to the requester */
  remarks?: string | null;
  releaseDate?: ISODateString;
  /** Required when status is claimed */
  claimedBy?: string;
}

export interface AssignRequestInput {
  windowId?: UUID | null;
  assignedTo?: UUID | null;
}

export interface UpdateInternalNotesInput {
  internalNotes: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Inputs: appointments, announcements                                       */
/* -------------------------------------------------------------------------- */

export interface BookAppointmentInput {
  windowId: UUID;
  scheduledAt: ISODateTimeString;
  requestId?: UUID;
  purpose?: string;
}

export interface UpdateAppointmentStatusInput {
  status: AppointmentStatus;
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  audience?: UserCategory | null;
  isPinned?: boolean;
  publishedAt?: ISODateTimeString | null;
  expiresAt?: ISODateTimeString | null;
}
export type UpdateAnnouncementInput = Partial<CreateAnnouncementInput>;

/* -------------------------------------------------------------------------- */
/*  Query filters                                                             */
/* -------------------------------------------------------------------------- */

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export interface RequestFilters extends PageParams {
  status?: RequestStatus | RequestStatus[];
  documentTypeId?: UUID;
  windowId?: UUID;
  assignedTo?: UUID;
  office?: Office;
  /** Matches reference number or requester name */
  search?: string;
  from?: ISODateString;
  to?: ISODateString;
}

export interface UserFilters extends PageParams {
  role?: UserRole;
  collegeId?: UUID;
  courseId?: UUID;
  isActive?: boolean;
  search?: string;
}

export interface PaymentFilters extends PageParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  search?: string;
}

export interface AppointmentFilters extends PageParams {
  windowId?: UUID;
  status?: AppointmentStatus;
  from?: ISODateTimeString;
  to?: ISODateTimeString;
}

export interface AuditLogFilters extends PageParams {
  actorId?: UUID;
  action?: string;
  entityType?: string;
  entityId?: UUID;
  from?: ISODateTimeString;
  to?: ISODateTimeString;
}

/* -------------------------------------------------------------------------- */
/*  Aggregates                                                                */
/* -------------------------------------------------------------------------- */

export type RequestStatusCounts = Record<RequestStatus, number>;
