'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Car,
  Bus,
  ParkingCircle,
  Clock,
} from 'lucide-react';
import type { ListingResponse } from '@/types';

interface LocationSectionProps {
  listing: ListingResponse;
}

export function LocationSection({ listing }: LocationSectionProps) {
  const query = encodeURIComponent(`${listing.district}, İstanbul`);
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=28.8%2C40.9%2C29.4%2C41.2&layer=mapnik&marker=41.0082%2C29.0`;
  const searchUrl = `https://www.openstreetmap.org/search?query=${query}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ib-card overflow-hidden"
    >
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <MapPin className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Konum</h3>
          <p className="text-xs text-muted-foreground">{listing.district}, {listing.city}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
        {/* Map */}
        <div className="overflow-hidden rounded-xl border border-border">
          <iframe
            title="Konum haritası"
            src={mapUrl}
            className="h-64 w-full"
            loading="lazy"
            style={{ border: 0 }}
          />
          <div className="flex items-center justify-between border-t border-border bg-card/50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {listing.district}, İstanbul
            </span>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Navigation className="h-3 w-3" />
              Yol Tarifi
            </a>
          </div>
        </div>

        {/* Travel info */}
        <div className="space-y-2.5">
          <div className="rounded-xl border border-border bg-card/50 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Car className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Araç ile</p>
                <p className="text-xs text-muted-foreground">Tahmini süre ve mesafe</p>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Süre</p>
                <p className="font-display font-bold text-foreground">~25 dk</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mesafe</p>
                <p className="font-display font-bold text-foreground">~18 km</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-soft text-success">
                <Bus className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Toplu Taşıma</p>
                <p className="text-xs text-muted-foreground">Otobüs + metro tahmini</p>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Süre</p>
                <p className="font-display font-bold text-foreground">~45 dk</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aktarma</p>
                <p className="font-display font-bold text-foreground">2</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft text-warning">
                <ParkingCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Park Yeri</p>
                <p className="text-xs text-muted-foreground">Yakın çevre otopark</p>
              </div>
              <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning">
                Orta
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
