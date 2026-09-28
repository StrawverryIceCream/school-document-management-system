export const userRoles = [
  "student",
  "staff",
  "admin",
  "teacher",
] as const;

export type UserRole = "student" | "staff" | "admin" | "teacher";
export type RequestStatus = "pending" | "processing" | "ready" | "claimed" | "rejected";

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends Timestamps {
  id: string;
  studentId: string | null;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
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

export interface Notification extends Timestamps {
  id: number;
  userId: number;
  requestId: number | null;
  message: string;
  isRead: boolean;
}

export interface DocumentRequestWithRelations extends DocumentRequest {
  user?: User;
  documentType?: DocumentType;
  payment?: Payment;
}