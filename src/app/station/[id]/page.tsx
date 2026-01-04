
'use client';

import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import type { Station } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingForm } from "@/components/booking-form";
import { Zap, Plug, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

import { useRealtimeSlots } from "@/hooks/use-realtime-slots";

export default function StationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const firestore = useFirestore();
  const realtimeSlots = useRealtimeSlots();

  const stationRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'charging_stations', id);
  }, [firestore, id]);

  const { data: stationData, isLoading } = useDoc<Station>(stationRef);

  // Override slots with realtime data for Friends Zone Station
  const station = React.useMemo(() => {
    if (!stationData) return null;
    if (stationData.id === 'station-1' || stationData.id === 'FVvzKSU1aPINjuU40TTI') { // Adjust ID as needed
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
    }
    return stationData;
  }, [stationData, realtimeSlots]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="overflow-hidden">
              <Skeleton className="w-full h-80" />
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-5 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
            <Card className="mt-8">
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-5 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {[...Array(4)].map((_, i) => <div key={i} className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>)}
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!station) {
    notFound();
  }

  const stationImage = PlaceHolderImages.find(p => p.id === station.image);
  const availableSlots = station.slots?.filter(s => s.status === 'available').length || 0;

  return (
    <AppLayout>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="overflow-hidden">
            {stationImage && (
              <div className="relative w-full h-80">
                <Image
                  src={stationImage.imageUrl}
                  alt={station.name}
                  data-ai-hint={stationImage.imageHint}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-headline text-3xl">{station.name}</CardTitle>
              <CardDescription>{station.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={availableSlots > 0 ? 'default' : 'destructive'} className="bg-accent text-accent-foreground text-base">
                {availableSlots} / {station.slots?.length || 0} slots available
              </Badge>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Available Slots</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {station.slots?.map(slot => (
                <Card key={slot.id} className={cn("p-4 flex flex-col gap-2", {
                  "bg-muted/30 border-dashed": slot.status === "unavailable",
                  "border-destructive/50": slot.status === "occupied"
                })}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">Slot {slot.id.split('-')[1]}</h4>
                    <Badge variant={slot.status === 'available' ? 'secondary' : 'destructive'} className={cn({
                      "bg-accent text-accent-foreground": slot.status === 'available',
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
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Book a Slot</CardTitle>
              <CardDescription>
                Secure your spot and avoid wait times. Booking is fast and easy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm station={station} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
