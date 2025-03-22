"use client";

import { useState, useEffect } from "react";
import { getUserWarningsAndSuspensions } from "@/lib/auth/actions";
import { Gavel } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type Warning = {
  id: number;
  reason: string;
  issuedAt: Date;
  adminUsername: string;
};

type Suspension = {
  id: number;
  reason: string;
  issuedAt: Date;
  adminUsername: string;
};

export default function UserWarnings() {
  const [isLoading, setIsLoading] = useState(true);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  
  useEffect(() => {
    const fetchUserWarnings = async () => {
      try {
        setIsLoading(true);
        const data = await getUserWarningsAndSuspensions();
        if (data && data.warnings) {
          setWarnings(data.warnings);
        }
        if (data && data.suspensions) {
          setSuspensions(data.suspensions);
        }
      } catch (error) {
        console.error("Failed to fetch warnings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserWarnings();
  }, []);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const hasItems = warnings.length > 0 || suspensions.length > 0;
  
  if (!hasItems) {
    return null;
  }
  
  return (
    <Popover>
      <PopoverTrigger className="relative p-2 hover:bg-neutral-100 rounded-md">
        <Gavel size={22} />
        {hasItems && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs"
          >
            {warnings.length + suspensions.length}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="px-4 py-3 font-medium border-b">
          Account Notifications
        </div>
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : !hasItems ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No recent warnings or suspensions
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="py-2">
              {suspensions.length > 0 && (
                <div className="px-1">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    ACCOUNT SUSPENSIONS
                  </div>
                  {suspensions.map(suspension => (
                    <div 
                      key={suspension.id} 
                      className="px-3 py-2 hover:bg-muted rounded-md my-1 text-sm"
                    >
                      <div className="font-medium flex justify-between">
                        <span>Account Suspended</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(suspension.issuedAt)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {suspension.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {warnings.length > 0 && (
                <div className="px-1">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    WARNINGS ({warnings.length})
                  </div>
                  {warnings.map(warning => (
                    <div 
                      key={warning.id} 
                      className="px-3 py-2 hover:bg-muted rounded-md my-1 text-sm"
                    >
                      <div className="font-medium flex justify-between">
                        <span>Warning Issued</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(warning.issuedAt)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {warning.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
} 