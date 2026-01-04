'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import type { Station, Slot } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Plug, Power, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore, useMemoFirebase, addDocumentNonBlocking, useUser } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// This page is now a public-facing page that does not require login.
// All requests are funneled through the `bookingRequests` collection.

const bookingFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
    vehicleNumber: z.string().min(3, { message: 'Vehicle number must be at least 3 characters.' }),
    duration: z.string().min(1, { message: 'Please specify the charging duration.' }),
});

const emergencyFormSchema = bookingFormSchema.extend({
    location: z.string().min(10, { message: "Please provide a more detailed location." }),
});

function BookingDialog({ slot, stationId, stationName, children }: { slot: Slot, stationId: string, stationName: string, children: React.ReactNode }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof bookingFormSchema>>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            name: user?.displayName || "",
            phoneNumber: "",
            vehicleNumber: "",
            duration: "60",
        },
    });

    // If user is logged in, pre-fill their name.
    React.useEffect(() => {
        if (user && isOpen) {
            form.setValue('name', user.displayName || '');
        }
    }, [user, isOpen, form])

    async function onSubmit(values: z.infer<typeof bookingFormSchema>) {
        if (!firestore) return;
        setIsLoading(true);

        const bookingsRef = collection(firestore, 'bookingRequests');
        try {
            await addDocumentNonBlocking(bookingsRef, {
                userId: user?.uid || 'guest',
                userName: values.name,
                phoneNumber: values.phoneNumber,
                vehicleNumber: values.vehicleNumber,
                duration: values.duration,
                stationId,
                stationName,
                slotId: slot.id,
                type: 'booking',
                status: 'pending',
                timestamp: serverTimestamp(),
            });
            toast({
                title: 'Booking Request Sent!',
                description: 'Your request has been sent for admin approval. You will be contacted via phone.',
                variant: 'default',
                className: 'bg-accent text-accent-foreground border-accent',
            });
            form.reset();
            setIsOpen(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Request Failed",
                description: "Could not send your request. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Book Slot {slot.id.split('-')[1]}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="vehicleNumber" render={({ field }) => (
                            <FormItem><FormLabel>Vehicle Number</FormLabel><FormControl><Input placeholder="EV-12345" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="duration" render={({ field }) => (
                            <FormItem><FormLabel>Charging Duration (minutes)</FormLabel><FormControl><Input type="number" placeholder="60" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Request
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function EmergencyBookingDialog({ stationId, children }: { stationId: string, children: React.ReactNode }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof emergencyFormSchema>>({
        resolver: zodResolver(emergencyFormSchema),
        defaultValues: {
            name: "",
            phoneNumber: "",
            vehicleNumber: "",
            duration: "60",
            location: "",
        },
    });

    React.useEffect(() => {
        if (user && isOpen) {
            form.setValue('name', user.displayName || '');
        }
    }, [user, isOpen, form])

    async function onSubmit(values: z.infer<typeof emergencyFormSchema>) {
        if (!firestore) return;
        setIsLoading(true);

        const bookingsRef = collection(firestore, 'bookingRequests');
        try {
            await addDocumentNonBlocking(bookingsRef, {
                userId: user?.uid || 'guest',
                userName: values.name,
                phoneNumber: values.phoneNumber,
                vehicleNumber: values.vehicleNumber,
                vehicleType: values.vehicleNumber, // Harmonize field
                duration: values.duration,
                location: values.location,
                type: 'emergency',
                status: 'pending',
                timestamp: serverTimestamp(),
            });
            toast({
                title: 'Emergency Request Sent!',
                description: 'Your request has been sent. An admin will contact you shortly via phone.',
                variant: 'default',
                className: 'bg-accent text-accent-foreground border-accent',
            });
            form.reset();
            setIsOpen(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Request Failed",
                description: "Could not send your request. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Emergency Charging Request</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="vehicleNumber" render={({ field }) => (
                            <FormItem><FormLabel>Vehicle Number</FormLabel><FormControl><Input placeholder="EV-12345" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="duration" render={({ field }) => (
                            <FormItem><FormLabel>Est. Charging Duration (minutes)</FormLabel><FormControl><Input type="number" placeholder="60" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Your Location</FormLabel><FormControl><Input placeholder="Corner of 5th and Main" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                            <Button type="submit" variant="destructive" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Request Emergency Service
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

import { useRealtimeSlots } from "@/hooks/use-realtime-slots";

export default function FriendsBookingPage() {
    const firestore = useFirestore();
    const stationId = 'FVvzKSU1aPINjuU40TTI';
    const realtimeSlots = useRealtimeSlots();

    const stationRef = useMemoFirebase(() => {
        if (!firestore || !stationId) return null;
        return doc(firestore, 'charging_stations', stationId);
    }, [firestore, stationId]);

    const { data: stationData, isLoading } = useDoc<Station>(stationRef);

    // Override slots with realtime data
    const station = React.useMemo(() => {
        if (!stationData) return null;
        const updatedSlots = stationData.slots?.map(slot => {
            if (slot.id === 'slot-1') {
                return { ...slot, status: (realtimeSlots.slot1 ? 'occupied' : 'available') as 'occupied' | 'available' };
            }
            if (slot.id === 'slot-2') {
                return { ...slot, status: (realtimeSlots.slot2 ? 'occupied' : 'available') as 'occupied' | 'available' };
            }
            return slot;
        });
        return { ...stationData, slots: updatedSlots };
    }, [stationData, realtimeSlots]);

    // MOCK DATA IMPLEMENTATION REMOVED
    // const station = mockStations.find(s => s.id === 'station-1') || null;
    // const isLoading = false;

    if (isLoading) {
        return (
            <AppLayout>
                <div className="space-y-8">
                    <Card className="overflow-hidden">
                        <Skeleton className="w-full h-80" />
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4 mb-2" />
                            <Skeleton className="h-5 w-full" />
                        </CardHeader>
                        <CardContent><Skeleton className="h-8 w-32" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        )
    }

    if (!station) {
        return (
            <AppLayout>
                <Card className="text-center">
                    <CardHeader><CardTitle>Station Not Found</CardTitle></CardHeader>
                    <CardContent><p>The requested charging station could not be found.</p></CardContent>
                </Card>
            </AppLayout>
        );
    }

    const stationImage = PlaceHolderImages.find(p => p.id === station.image);
    const availableSlots = station.slots?.filter(s => s.status === 'available') || [];

    return (
        <AppLayout>
            <div className="space-y-8">
                <Card className="overflow-hidden">
                    {stationImage && (
                        <div className="relative w-full h-80"><Image src={stationImage.imageUrl} alt={station.name} fill className="object-cover" /></div>
                    )}
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">{station.name}</CardTitle>
                        <CardDescription>{station.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge variant={availableSlots.length > 0 ? 'default' : 'destructive'} className="bg-accent text-accent-foreground text-base">
                            {availableSlots.length} / {station.slots?.length || 0} slots available
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Book a Charging Slot</CardTitle>
                        <CardDescription>Select an available slot below to send a booking request. You will be contacted by phone for confirmation.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        {station.slots?.slice(0, 2).map(slot => (
                            <Card key={slot.id} className={cn("p-4 flex flex-col gap-4", {
                                "bg-muted/30 border-dashed": slot.status === 'unavailable',
                                "border-green-500/50 bg-green-500/10": slot.status === 'available',
                                "border-destructive/50 bg-destructive/10": slot.status === 'occupied'
                            })}>
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold">Slot {slot.id.split('-')[1]}</h4>
                                    <Badge variant={slot.status === 'available' ? 'secondary' : 'destructive'}
                                        className={cn({
                                            "bg-accent text-accent-foreground border-accent": slot.status === 'available',
                                            "bg-destructive text-destructive-foreground": slot.status === 'occupied',
                                            "bg-muted text-muted-foreground": slot.status === 'unavailable',
                                        })}>
                                        {slot.status}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <div className="flex items-center gap-2"><Plug className="size-4" /> {slot.charger.connector}</div>
                                    <div className="flex items-center gap-2"><Zap className="size-4" /> {slot.charger.type}</div>
                                    <div className="flex items-center gap-2"><Power className="size-4" /> {slot.charger.power}</div>
                                </div>
                                <BookingDialog slot={slot} stationId={station.id} stationName={station.name}>
                                    <Button
                                        className={cn("w-full", {
                                            "bg-accent hover:bg-accent/90": slot.status === 'available',
                                            "bg-destructive hover:bg-destructive/90": slot.status === 'occupied',
                                        })}
                                        disabled={slot.status !== 'available'}
                                    >
                                        {slot.status === 'available' ? 'Book Slot' : 'Occupied'}
                                    </Button>
                                </BookingDialog>
                            </Card>
                        ))}
                    </CardContent>
                </Card>

                <Separator />

                <Card className="border-destructive/50">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="size-8 text-destructive" />
                            <div>
                                <CardTitle className="font-headline text-2xl text-destructive">Emergency Service</CardTitle>
                                <CardDescription>Request immediate assistance if you are stranded.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <EmergencyBookingDialog stationId={station.id}>
                            <Button variant="destructive" className="w-full">Request Emergency Charging</Button>
                        </EmergencyBookingDialog>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
