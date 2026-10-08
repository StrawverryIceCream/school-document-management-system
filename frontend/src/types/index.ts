export const userRoles = ["student", "teacher", "admin", "staff"] as const;

export type UserRole = "student" | "teacher" | "admin" | "staff";
export type RequestStatus =
  | "pending"
  | "processing"
  | "ready"
  | "claimed"
  | "cancelled";

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
  id: string;
  userId: string;
  documentTypeId: string;
  purpose: string | null;
  formData: Record<string, unknown>;
  status: RequestStatus;
  releaseDate: string | null;
  claimedAt: Date | null;
  staffNotes: string | null;
  tags?: string[];
}

export interface Payment extends Timestamps {
  id: string;
  requestId: string;
  amount: string;
  method: string;
  paymentProofUrl: string | null;
  status: "pending" | "verified" | "rejected";
  rejectionReason: string | null;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  receiptNumber: string | null;
}

export interface DocumentRequestWithRelations extends DocumentRequest {
  user?: User;
  documentType?: DocumentType;
  payment?: Payment;
}
