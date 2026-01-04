'use client';

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Station } from "@/lib/data";

const stationFormSchema = z.object({
  name: z.string().min(3, "Station name must be at least 3 characters."),
  address: z.string().min(10, "Address must be at least 10 characters."),
});

type StationFormValues = z.infer<typeof stationFormSchema>;

interface StationFormProps {
  station?: Station | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
}

export function StationForm({ station, open, onOpenChange, onFormSubmit }: StationFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!station;

  const form = useForm<StationFormValues>({
    resolver: zodResolver(stationFormSchema),
    defaultValues: {
      name: station?.name || "",
      address: station?.address || "",
    },
  });
  
  // Reset form when station data changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: station?.name || "",
        address: station?.address || "",
      });
    }
  }, [station, open, form]);


  async function onSubmit(values: StationFormValues) {
    if (!firestore) {
      toast({ variant: "destructive", title: "Firestore not available." });
      return;
    }
    
    setIsLoading(true);

    try {
      if (isEditing && station) {
        const stationRef = doc(firestore, "charging_stations", station.id);
        const updatedData = {
          ...station,
          name: values.name,
          address: values.address,
        };
        setDocumentNonBlocking(stationRef, updatedData, { merge: true });
        toast({ title: "Station Updated", description: `"${values.name}" has been updated.` });
      } else {
        const stationsRef = collection(firestore, "charging_stations");
        const newStationData = {
          name: values.name,
          address: values.address,
          // Default values for a new station
          location: { lat: 17.3239, lng: 78.3082 },
          image: "station-1",
          slots: [
             { id: 'slot-1', status: 'available', charger: { type: 'AC', connector: 'Type 2', power: '22kW' } },
             { id: 'slot-2', status: 'available', charger: { type: 'DC', connector: 'CCS', power: '50kW' } },
          ]
        };
        await addDocumentNonBlocking(stationsRef, newStationData);
        toast({ title: "Station Added", description: `"${values.name}" has been created.` });
      }
      onFormSubmit();
      onOpenChange(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Station" : "Add New Station"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Station Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., City Center Charging Hub" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown, USA" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Save Changes" : "Create Station"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
