"use client";

import { useState, useEffect } from "react";
import { getUserActionNotifications } from "@/lib/transactions/actions";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Notification = {
  id: number;
  type: string;
  time: Date;
  transaction_id: number;
};

export default function UserNotifications() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await getUserActionNotifications();
        if (data) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const hasNotifications = notifications.length > 0;
  
  if (!hasNotifications && !isLoading) {
    return null;
  }
  
  return (
    <Popover>
      <PopoverTrigger className="relative p-2 hover:bg-neutral-100 rounded-md">
        <Bell size={22} />
        {hasNotifications && (
          <Badge 
            variant="default" 
            className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs"
          >
            {notifications.length}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="px-4 py-3 font-medium border-b">
          Transaction Notifications
        </div>
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : !hasNotifications ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No recent transaction activity
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="py-2">
              <div className="px-1">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  RECENT ACTIVITY
                </div>
                {notifications.map(notification => (
                  <Link 
                    key={notification.id} 
                    href={`/transactions/${notification.transaction_id}`}
                  >
                    <div className="px-3 py-2 hover:bg-muted rounded-md my-1 text-sm">
                      <div className="font-medium flex justify-between">
                        <span>
                          {notification.type === 'tool_borrowed' ? 'Tool Borrowed' : 
                           notification.type === 'tool_returned' ? 'Tool Returned' : 
                           notification.type === 'transaction_requested' ? 'Borrow Request' : 
                           notification.type === 'transaction_accepted' ? 'Request Accepted' : 
                           'Transaction Update'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.time)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Transaction #{notification.transaction_id}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}