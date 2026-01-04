
'use client';

import { useState } from "react";
import type { Station, Slot } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Lock, Unlock, Wrench } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { StationForm } from "./station-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function StationsTab() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const stationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'charging_stations');
  }, [firestore]);
  const { data: stations, isLoading, error } = useCollection<Station>(stationsQuery);

  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const handleAddClick = () => {
    setSelectedStation(null);
    setFormOpen(true);
  };

  const handleEditClick = (station: Station) => {
    setSelectedStation(station);
    setFormOpen(true);
  };

  const handleDeleteClick = (station: Station) => {
    setSelectedStation(station);
    setAlertOpen(true);
  };
  
  const confirmDelete = () => {
    if (firestore && selectedStation) {
      const stationRef = doc(firestore, "charging_stations", selectedStation.id);
      deleteDocumentNonBlocking(stationRef);
      toast({ title: "Station Deleted", description: `"${selectedStation.name}" has been removed.` });
    }
    setAlertOpen(false);
    setSelectedStation(null);
  };

  const handleSlotStatusChange = (station: Station, slotId: string, newStatus: Slot['status']) => {
    if (!firestore) return;

    const stationRef = doc(firestore, 'charging_stations', station.id);
    const updatedSlots = station.slots.map(slot => 
      slot.id === slotId ? { ...slot, status: newStatus } : slot
    );

    setDocumentNonBlocking(stationRef, { slots: updatedSlots }, { merge: true });
    toast({
        title: "Slot Updated",
        description: `Slot ${slotId.split('-')[1]} is now ${newStatus}.`
    });
  }

  const handleFormSubmit = () => {
     // This could be used to trigger a re-fetch if useCollection didn't update automatically
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}><PlusCircle className="mr-2 size-4"/> Add Station</Button>
      </div>

      <StationForm
        station={selectedStation}
        open={isFormOpen}
        onOpenChange={setFormOpen}
        onFormSubmit={handleFormSubmit}
      />
      
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              station "{selectedStation?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Desktop View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slots</TableHead>
              <TableHead className="text-center">Overall Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && [...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                <TableCell><div className="flex justify-end"><Skeleton className="h-8 w-8" /></div></TableCell>
              </TableRow>
            ))}
            {stations?.map((station) => {
              const isOnline = station.slots?.some(s => s.status !== 'unavailable');
              return (
                <TableRow key={station.id}>
                  <TableCell className="font-medium align-top">
                    <div className="font-bold">{station.name}</div>
                    <div className="text-sm text-muted-foreground">{station.address}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                        {station.slots?.map(slot => (
                            <div key={slot.id} className="flex items-center gap-2">
                                <Badge variant="outline" className={cn({
                                    "bg-accent/20 border-accent text-accent-foreground": slot.status === 'available',
                                    "bg-destructive/20 border-destructive text-destructive-foreground": slot.status === 'occupied',
                                    "bg-muted/50 border-dashed text-muted-foreground": slot.status === 'unavailable',
                                })}>{slot.status}</Badge>
                                <span className="text-sm">Slot {slot.id.split('-')[1]}</span>
                                <span className="text-xs text-muted-foreground">({slot.charger.type} - {slot.charger.power})</span>
                            </div>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-top">
                    <Badge variant={isOnline ? "secondary" : "destructive"} className={isOnline ? "bg-accent text-accent-foreground" : ""}>
                        {isOnline ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEditClick(station)}><Edit className="mr-2"/>Edit Station</DropdownMenuItem>
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger><Wrench className="mr-2"/>Manage Slots</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuLabel>Set Slot Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {station.slots.map(slot => (
                                         <DropdownMenuSub key={slot.id}>
                                            <DropdownMenuSubTrigger>Slot {slot.id.split('-')[1]}</DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => handleSlotStatusChange(station, slot.id, 'available')}><Unlock className="mr-2"/>Set as Available</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleSlotStatusChange(station, slot.id, 'occupied')}><Lock className="mr-2"/>Set as Occupied</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleSlotStatusChange(station, slot.id, 'unavailable')}><Wrench className="mr-2"/>Set as Unavailable</DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleDeleteClick(station)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" /> Delete Station
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
             {!isLoading && (!stations || stations.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No stations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
         {isLoading && [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <Skeleton className="h-6 w-40 mb-1" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="size-8" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </CardContent>
            </Card>
        ))}
        {stations?.map((station) => {
          const isOnline = station.slots?.some(s => s.status !== 'unavailable');
          
          return (
            <Card key={station.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{station.name}</CardTitle>
                        <CardDescription>{station.address}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" className="-mt-2 -mr-2">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEditClick(station)}>Edit Station</DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Manage Slots</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuLabel>Set Slot Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {station.slots.map(slot => (
                                         <DropdownMenuSub key={slot.id}>
                                            <DropdownMenuSubTrigger>Slot {slot.id.split('-')[1]}</DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => handleSlotStatusChange(station, slot.id, 'available')}><Unlock className="mr-2"/>Available</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleSlotStatusChange(station, slot.id, 'occupied')}><Lock className="mr-2"/>Occupied</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleSlotStatusChange(station, slot.id, 'unavailable')}><Wrench className="mr-2"/>Unavailable</DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleDeleteClick(station)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    {station.slots?.map(slot => (
                        <div key={slot.id} className="flex items-center gap-2">
                             <Badge variant="outline" className={cn({
                                "bg-accent/20 border-accent text-accent-foreground": slot.status === 'available',
                                "bg-destructive/20 border-destructive text-destructive-foreground": slot.status === 'occupied',
                                "bg-muted/50 border-dashed text-muted-foreground": slot.status === 'unavailable',
                            })}>{slot.status}</Badge>
                            <span className="text-sm">Slot {slot.id.split('-')[1]}</span>
                            <span className="text-xs text-muted-foreground">({slot.charger.type} - {slot.charger.power})</span>
                        </div>
                    ))}
                 </div>
                <Badge variant={isOnline ? "secondary" : "destructive"} className={cn("w-fit", isOnline ? "bg-accent text-accent-foreground" : "")}>
                    {isOnline ? "Online" : "Offline"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
        {!isLoading && (!stations || stations.length === 0) && (
            <p className="text-muted-foreground text-center py-8">
                No stations found.
            </p>
        )}
      </div>
    </div>
  );
}
