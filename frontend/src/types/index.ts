export const userRoles = [
  "student",
  "staff",
  "admin",
  "teacher",
] as const;

export type UserRole = "student" | "staff" | "admin" | "teacher"; 
export type RequestStatus = "pending" | "processing" | "ready" | "claimed" | "rejected"; // 

export type RequestRow = {
  id: string;
  applicant: string;
  document: string;
  college?: string | null;
  window?: string | null;
  submittedAt?: string | null;
  status: "pending" | "processing" | "ready" | "claimed" | "cancelled" | "rejected";
  purpose?: string | null;
  createdAt?: string | null;
};

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
  type: "text" | "number" | "date" | "select" | "checkbox"; // adjust to your actual field types
  required: boolean;
  options?: string[]; // for "select" type
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
};

export interface DocumentRequest extends Timestamps {
  id: number;
  userId: number;
  documentTypeId: number;
  purpose: string | null;
  formData: Record<string, unknown>; // shape depends on the document type's requiredFields
  status: RequestStatus;
  releaseDate: string | null; // date columns come back as string ("YYYY-MM-DD")
  claimedAt: Date | null;
  staffNotes: string | null;
  tags?: string[];
}

export interface Payment extends Timestamps {
  id: number;
  requestId: number;
  amount: string; // numeric -> string
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