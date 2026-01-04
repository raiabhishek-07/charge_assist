
"use client";

import type { Station } from "@/lib/data";

export function MapView({ stations, isLoading }: { stations: Station[], isLoading: boolean }) {
  if (isLoading || !stations || stations.length === 0) {
    return <div className="w-full h-[600px] bg-muted animate-pulse rounded-lg" />;
  }

  const station = stations[0];
  const { lat, lng } = station.location;

  // Create bounding box for the iframe view
  const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
  
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
       <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      ></iframe>
    </div>
  );
}
