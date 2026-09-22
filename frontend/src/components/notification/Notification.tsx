import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "../ui/separator";
import { Card } from "../ui/card";

export interface NotificationType {
  id: number;
  userId: number;
  requestId: number | null;
  message: string;
  isRead: boolean;
}

const notifs: NotificationType[] = [
  {
    id: 1,
    userId: 1,
    requestId: 1,
    message: "Collect on September 12",
    isRead: false,
  },
];

function Notification() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-150 h-150" align="end">
        <div className="flex flex-col gap-2 p-4">
          <h1 className="font-medium text-xl">Notifications</h1>
          <Separator />
          {notifs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications</p>
          ) : (
            notifs.map((notif) => (
              <div
                key={notif.requestId}
                className="rounded-md p-2 text-sm hover:bg-accent h-16"
              >
                {notif.message}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Notification;
