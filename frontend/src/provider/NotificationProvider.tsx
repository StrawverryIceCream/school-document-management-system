import {
  getMyNotifications,
  markAllAsRead as markAllNotificationsAsRead,
  markAsRead as markNotificationAsRead,
} from "@/api/notifications";
import { NotificationContext } from "@/context/NotificationContext";
import type { Notification } from "@/context/NotificationContext";
import { useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const latestLoadId = useRef(0);

  const refreshNotifications = useCallback(async () => {
    const loadId = ++latestLoadId.current;
    if (!user?.id) {
      setNotifications([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getMyNotifications({ limit: 100 });
      if (loadId !== latestLoadId.current) return;
      setNotifications(response.data);
      setError(null);
    } catch (notificationError) {
      if (loadId !== latestLoadId.current) return;
      console.error("Failed to load notifications:", notificationError);
      setNotifications([]);
      setError(
        notificationError instanceof Error
          ? notificationError.message
          : "Failed to load notifications",
      );
    } finally {
      if (loadId === latestLoadId.current) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      void Promise.resolve().then(refreshNotifications);
    }
  }, [authLoading, refreshNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      const notification = notifications.find((item) => item.id === id);
      if (!notification || notification.isRead) return;

      try {
        const updated = await markNotificationAsRead(id);
        setNotifications((current) =>
          current.map((item) => (item.id === id ? updated : item)),
        );
        setError(null);
      } catch (notificationError) {
        console.error("Failed to mark notification as read:", notificationError);
        setError(
          notificationError instanceof Error
            ? notificationError.message
            : "Failed to mark notification as read",
        );
      }
    },
    [notifications],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
      setError(null);
    } catch (notificationError) {
      console.error("Failed to mark all notifications as read:", notificationError);
      setError(
        notificationError instanceof Error
          ? notificationError.message
          : "Failed to mark all notifications as read",
      );
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
