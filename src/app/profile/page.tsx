'use client';

import React from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { useUser } from "@/firebase";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return (
            <AppLayout>
                 <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                <Skeleton className="w-24 h-24 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-40" />
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </AppLayout>
        )
    }
    
    // This should only happen if the user is not logged in, in which case the AppLayout will handle redirection.
    if (!user) {
        return null;
    }
    
    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-3xl font-headline font-bold">My Profile</h1>
                    <Button variant="outline" className="w-full sm:w-auto"><Pencil className="mr-2 size-4" /> Edit Profile</Button>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            <Avatar className="w-24 h-24">
                                {user.photoURL && <AvatarImage src={user.photoURL} alt="User" />}
                                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold">{user.displayName || 'New User'}</h2>
                                <p className="text-muted-foreground">{user.email}</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.metadata.creationTime ? `Joined on ${format(new Date(user.metadata.creationTime), 'MMMM dd, yyyy')}` : ''}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
