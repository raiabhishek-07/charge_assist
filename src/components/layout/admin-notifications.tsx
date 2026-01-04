"use client";

import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { BookingRequest } from "@/lib/data";
import { formatDistanceToNow } from 'date-fns';

export function AdminNotifications() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const pendingRequestsQuery = useMemoFirebase(() => {
    // This query will only succeed if the user is an admin.
    // It is now gated by isUserLoading, and will only proceed if there is a user.
    if (isUserLoading || !user || !firestore) {
      return null;
    }
    return query(collection(firestore, 'bookingRequests'), where('status', '==', 'pending'));
  }, [firestore, user, isUserLoading]);


  const { data: pendingRequests, error } = useCollection<BookingRequest>(pendingRequestsQuery);
  
  // If there's an error (like permission denied), don't render the component.
  // This gracefully handles non-admins.
  if (error) {
    return null;
  }

  const pendingCount = pendingRequests?.length || 0;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '...';
    try {
        const date = timestamp.toDate();
        return `${formatDistanceToNow(date)} ago`;
    } catch(e) {
        return 'a while ago';
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
          )}
          <span className="sr-only">View Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notifications</h4>
            <p className="text-sm text-muted-foreground">
              You have {pendingCount} pending requests.
            </p>
          </div>
          {pendingCount > 0 ? (
            <div className="grid gap-2">
                <div className="grid grid-cols-2 items-center gap-4">
                    <p className="font-semibold">Request</p>
                    <p className="text-right text-sm text-muted-foreground">Received</p>
                </div>
                {pendingRequests?.map(request => (
                    <div key={request.id} className="grid grid-cols-2 items-center gap-4">
                        <p className="truncate text-sm">{request.userName}'s {request.type}</p>
                        <p className="text-right text-xs text-muted-foreground">{formatDate(request.timestamp)}</p>
                    </div>
                ))}
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-4">No new notifications.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
