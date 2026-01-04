// This file contains type definitions for our Firestore data structures.

export type Charger = {
  type: "AC" | "DC";
  connector: "Type 2" | "CCS" | "CHAdeMO";
  power: string;
};

export type Slot = {
  id: string;
  status: "available" | "occupied" | "unavailable";
  charger: Charger;
};

export type Station = {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  slots: Slot[];
  image: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: any; // Firestore Timestamp
};

export type BookingRequest = {
  id: string;
  userId: string;
  userName: string;
  type: 'booking' | 'emergency';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: any; // Firestore Timestamp

  // Booking-specific fields
  stationId?: string;
  stationName?: string;
  slotId?: string;
  vehicleNumber?: string;

  // Emergency-specific fields
  location?: string;
  vehicleType?: string;
  message?: string;
}

export type Payment = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  status: 'succeeded' | 'failed' | 'pending';
};

// Mock data is no longer used for most things, but keeping one for the payments tab as an example.
export const payments: Payment[] = [
  { id: "pay-1", userId: "user-1", userName: "Alice Johnson", amount: 25.50, date: "2024-07-19", status: 'succeeded' },
  { id: "pay-2", userId: "user-2", userName: "Bob Williams", amount: 15.75, date: "2024-07-18", status: 'succeeded' },
  { id: "pay-3", userId: "user-3", userName: "Charlie Brown", amount: 32.00, date: "2024-07-17", status: 'failed' },
  { id: "pay-4", userId: "user-4", userName: "Diana Miller", amount: 18.20, date: "2024-07-16", status: 'succeeded' },
];

export const mockStations: Station[] = [
  {
    id: "station-1",
    name: "Central Green Charge",
    address: "123 Eco Avenue, Downtown",
    location: { lat: 37.7749, lng: -122.4194 },
    image: "/placeholder.svg", // You might want to use a real image path or placeholder
    slots: [
      { id: "slot-1", status: "available", charger: { type: "DC", connector: "CCS", power: "150kW" } },
      { id: "slot-2", status: "occupied", charger: { type: "DC", connector: "CCS", power: "150kW" } },
      { id: "slot-3", status: "available", charger: { type: "AC", connector: "Type 2", power: "22kW" } },
    ]
  },
  {
    id: "station-2",
    name: "Tech Park EV Hub",
    address: "45 Innovation Dr, Tech District",
    location: { lat: 37.7849, lng: -122.4094 },
    image: "/placeholder.svg",
    slots: [
      { id: "slot-4", status: "available", charger: { type: "DC", connector: "CHAdeMO", power: "50kW" } },
      { id: "slot-5", status: "unavailable", charger: { type: "DC", connector: "CCS", power: "50kW" } },
    ]
  },
  {
    id: "station-3",
    name: "Suburban Fast Fill",
    address: "789 Pine Road, Suburbia",
    location: { lat: 37.7649, lng: -122.4294 },
    image: "/placeholder.svg",
    slots: [
      { id: "slot-6", status: "available", charger: { type: "AC", connector: "Type 2", power: "7kW" } },
      { id: "slot-7", status: "available", charger: { type: "AC", connector: "Type 2", power: "7kW" } },
      { id: "slot-8", status: "available", charger: { type: "AC", connector: "Type 2", power: "7kW" } },
    ]
  }
];
