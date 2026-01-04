"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Station } from "@/lib/data";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  vehicleNumber: z.string().min(3, "Vehicle number must be at least 3 characters."),
  slotId: z.string().min(1, "Please select a slot."),
});

export function BookingForm({ station }: { station: Station }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const availableSlots = station.slots?.filter(s => s.status === "available") || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleNumber: "",
      slotId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to make a booking.",
      });
      return;
    }
    
    setIsLoading(true);

    const bookingRef = collection(firestore, 'bookingRequests');
    
    const bookingData = {
      userId: user.uid,
      userName: user.displayName || user.email,
      type: 'booking',
      stationId: station.id,
      stationName: station.name,
      slotId: values.slotId,
      vehicleNumber: values.vehicleNumber,
      timestamp: serverTimestamp(),
      status: 'pending'
    };

    try {
      await addDocumentNonBlocking(bookingRef, bookingData);
      toast({
        title: "Booking Request Sent!",
        description: `Your request for slot ${values.slotId.split('-')[1]} is pending admin approval.`,
        variant: 'default',
        className: 'bg-accent text-accent-foreground border-accent'
      });
      form.reset();
    } catch (error) {
      console.error("Booking failed:", error);
      toast({
          variant: "destructive",
          title: "Booking Failed",
          description: "Could not complete your booking. Please try again.",
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="vehicleNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Number</FormLabel>
              <FormControl>
                <Input placeholder="EV-12345" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slotId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Slot</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={availableSlots.length === 0 || isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={availableSlots.length > 0 ? "Select an available slot" : "No slots available"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableSlots.map(slot => (
                     <SelectItem key={slot.id} value={slot.id}>
                       Slot {slot.id.split('-')[1]} ({slot.charger.connector} - {slot.charger.power})
                     </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={availableSlots.length === 0 || isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Request Booking
        </Button>
      </form>
    </Form>
  );
}
