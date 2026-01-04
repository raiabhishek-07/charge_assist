'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <TriangleAlert className="size-16 text-destructive" />
                </div>
                <CardTitle className="text-3xl font-headline">Something Went Wrong</CardTitle>
                <CardDescription>
                    An unexpected error has occurred.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    We apologize for the inconvenience. Please try again, or contact support if the problem persists.
                </p>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
