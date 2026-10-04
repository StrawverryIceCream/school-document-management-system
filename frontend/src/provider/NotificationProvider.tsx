import {
  getMyNotifications,
  markAllAsRead as markAllNotificationsAsRead,
  markAsRead as markNotificationAsRead,
  NotificationApiError,
} from "@/api/notifications";
import { NotificationContext } from "@/context/NotificationContext";
import { notificationMockData } from "@/data/notification.mock";
import { useAuth } from "@/hooks/useAuth";
import type { Notification } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setError(null);
      setUsingMockData(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getMyNotifications({ limit: 100 });
      if (response.data.length === 0) {
        setNotifications(notificationMockData);
        setError(
          "No notifications were returned by the API. Showing sample notifications.",
        );
        setUsingMockData(true);
      } else {
        setNotifications(response.data);
        setError(null);
        setUsingMockData(false);
      }
    } catch (notificationError) {
      console.error("Failed to load notifications:", notificationError);
      if (
        notificationError instanceof NotificationApiError &&
        (notificationError.status === 404 || notificationError.status === 405)
      ) {
        setNotifications(notificationMockData);
        setUsingMockData(true);
        setError(
          "The notifications endpoint is unavailable. Showing sample notifications.",
        );
      } else {
        setNotifications([]);
        setUsingMockData(false);
        setError(
          notificationError instanceof Error
            ? notificationError.message
            : "Failed to load notifications",
        );
      }
    } finally {
      setLoading(false);
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

      if (usingMockData) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === id ? { ...item, isRead: true } : item,
          ),
        );
        return;
      }

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
    [notifications, usingMockData],
  );

  const markAllAsRead = useCallback(async () => {
    if (usingMockData) {
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
      return;
    }

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
  }, [usingMockData]);

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
        usingMockData,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
