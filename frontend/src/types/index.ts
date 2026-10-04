export const userRoles = ["student", "staff", "admin", "teacher"] as const;

export type UserRole = "student" | "staff" | "admin" | "teacher";
export type RequestStatus =
  | "pending"
  | "processing"
  | "ready"
  | "claimed"
  | "rejected";

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export type AuthUser = Omit<User, "createdAt" | "updatedAt">;

export interface User extends Timestamps {
  id: string;
  studentId: string | null;
  fullName: string;
  email: string;
  role: UserRole;
  department: string | null;
  college: string | null;
  course: string | null;
  section: string | null;
}

export interface RequiredFieldDefinition {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox";
  required: boolean;
  options?: string[];
}

export type RequiredFieldValues = Record<string, string | number | boolean>;

export interface DocumentType extends Timestamps {
  id: number;
  code: string;
  name: string;
  description: string | null;
  fee: string;
  isActive: boolean;
  requiredFields: RequiredFieldDefinition[];
}

export interface NewDocument {
  code: string;
  name: string;
  description: string;
  fee: string;
  isActive: boolean;
  requiredFields: RequiredFieldDefinition[];
}

export interface DocumentRequest extends Timestamps {
  id: number;
  userId: number;
  documentTypeId: number;
  purpose: string | null;
  formData: Record<string, unknown>;
  status: RequestStatus;
  releaseDate: string | null;
  claimedAt: Date | null;
  staffNotes: string | null;
  tags?: string[];
}

export interface Payment extends Timestamps {
  id: number;
  requestId: number;
  amount: string;
  method: string;
  receiptNumber: string;
  paidAt: Date;
}

export interface NotificationSender {
  id: string;
  fullName: string;
  role: UserRole;
}

export type NotificationKind =
  | "approved"
  | "ready"
  | "processing"
  | "rejected"
  | "submitted";

export interface Notification extends Timestamps {
  id: string;
  userId: string;
  senderId: string | null;
  requestId: string | null;
  title: string;
  message: string;
  isRead: boolean;
  type?: NotificationKind;
  sender?: NotificationSender | null;
}

export interface DocumentRequestWithRelations extends DocumentRequest {
  user?: User;
  documentType?: DocumentType;
  payment?: Payment;
}
