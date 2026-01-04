'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <TriangleAlert className="size-16 text-destructive" />
                </div>
                <CardTitle className="text-3xl font-headline">404 - Page Not Found</CardTitle>
                <CardDescription>
                    Sorry, the page you are looking for could not be found.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    It seems you've followed a broken link or entered a URL that doesn't exist.
                </p>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button asChild>
                    <Link href="/">Go Back to Homepage</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
