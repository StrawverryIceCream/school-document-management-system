import { createContext } from "react";
import type { UserRole } from "@/types";

export type NotificationKind =
  | "approved"
  | "ready"
  | "processing"
  | "rejected"
  | "submitted";

export interface NotificationSender {
  id: string;
  fullName: string;
  role: UserRole;
}

export interface Notification {
  id: string;
  userId: string;
  senderId: string | null;
  requestId: string | null;
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  type?: NotificationKind;
  sender?: NotificationSender | null;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  usingMockData: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationContext =
  createContext<NotificationContextType | null>(null);
