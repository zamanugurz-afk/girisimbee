'use client';

import { useEffect, useRef } from 'react';
import type { CompetitorPoi, RadarListingMatch } from '@/types/radar.types';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

interface InvestmentRadarMapProps {
  centerLat: number;
  centerLng: number;
  zoom: number;
  radiusMeters: number;
  competitors: CompetitorPoi[];
  listings: RadarListingMatch[];
  onCircleChanged: (lat: number, lng: number, radius: number) => void;
  isDrawingMode?: boolean;
}

export default function InvestmentRadarMap({
  centerLat,
  centerLng,
  zoom,
  radiusMeters,
  competitors,
  listings,
  onCircleChanged,
}: InvestmentRadarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const circleLayerRef = useRef<any>(null);
  const competitorsLayerGroupRef = useRef<any>(null);
  const listingsLayerGroupRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  const radiusMetersRef = useRef(radiusMeters);
  radiusMetersRef.current = radiusMeters;

  const onCircleChangedRef = useRef(onCircleChanged);
  onCircleChangedRef.current = onCircleChanged;

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      const L = (await import('leaflet')).default;
      await import('@geoman-io/leaflet-geoman-free');

      if (!containerRef.current || !isMounted) return;

      const map = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom,
        zoomControl: false,
      });

      mapRef.current = map;
      isInitializedRef.current = true;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      if (map.pm) {
        map.pm.addControls({
          position: 'topleft',
          drawCircle: true,
          drawPolygon: true,
          drawMarker: false,
          drawCircleMarker: false,
          drawPolyline: false,
          drawRectangle: false,
          cutPolygon: false,
          dragMode: true,
          editMode: true,
          removalMode: true,
        });

        map.pm.setPathOptions({
          color: '#F59E0B',
          fillColor: '#F59E0B',
          fillOpacity: 0.12,
          weight: 2,
        });

        map.on('pm:create', (e: any) => {
          const layer = e.layer;
          if (e.shape === 'Circle') {
            const center = layer.getLatLng();
            const radius = layer.getRadius();
            map.removeLayer(layer);
            onCircleChangedRef.current(center.lat, center.lng, Math.round(radius));
          } else if (e.shape === 'Polygon') {
            const bounds = layer.getBounds();
            const center = bounds.getCenter();
            const northEast = bounds.getNorthEast();
            const approxRadius = Math.round(center.distanceTo(northEast));
            map.removeLayer(layer);
            onCircleChangedRef.current(center.lat, center.lng, approxRadius);
          }
        });
      }

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onCircleChangedRef.current(lat, lng, radiusMetersRef.current);
      });

      competitorsLayerGroupRef.current = L.layerGroup().addTo(map);
      listingsLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([centerLat, centerLng], zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [centerLat, centerLng, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then(({ default: L }) => {
      const map = mapRef.current;
      if (!map) return;

      if (circleLayerRef.current) {
        map.removeLayer(circleLayerRef.current);
        circleLayerRef.current = null;
      }

      const circle = L.circle([centerLat, centerLng], {
        radius: radiusMeters,
        color: '#F59E0B',
        fillColor: '#F59E0B',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(map);

      circle.on('click', (e: any) => {
        onCircleChangedRef.current(e.latlng.lat, e.latlng.lng, radiusMetersRef.current);
      });

      circleLayerRef.current = circle;

      if (centerMarkerRef.current) {
        map.removeLayer(centerMarkerRef.current);
        centerMarkerRef.current = null;
      }

      const centerIcon = L.divIcon({
        className: 'custom-center-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing">
            <div class="h-4 w-4 rounded-full bg-slate-950 dark:bg-white border-2 border-amber-500 shadow-md flex items-center justify-center">
              <div class="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
            </div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const centerMarker = L.marker([centerLat, centerLng], {
        icon: centerIcon,
        draggable: true,
        zIndexOffset: 1000,
      }).addTo(map);

      centerMarker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        onCircleChangedRef.current(pos.lat, pos.lng, radiusMetersRef.current);
      });

      centerMarkerRef.current = centerMarker;
    });
  }, [centerLat, centerLng, radiusMeters]);

  useEffect(() => {
    if (!mapRef.current || !competitorsLayerGroupRef.current) return;

    import('leaflet').then(({ default: L }) => {
      const layerGroup = competitorsLayerGroupRef.current;
      if (!layerGroup) return;

      layerGroup.clearLayers();

      for (const poi of competitors) {
        const poiIcon = L.divIcon({
          className: 'custom-poi-marker',
          html: `
            <div class="group relative flex items-center justify-center cursor-pointer">
              <div class="h-3 w-3 rounded-full bg-rose-500 border border-white shadow-xs transition-transform duration-150 hover:scale-150"></div>
            </div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon });
        marker.bindPopup(
          `
          <div style="font-family: inherit; padding: 2px 4px; min-width: 140px;">
            <p style="font-weight: 700; font-size: 12px; margin: 0 0 2px 0; color: #0f172a;">${poi.name}</p>
            <p style="font-size: 11px; margin: 0; color: #64748b;">${poi.categoryLabel}</p>
            <p style="font-size: 10px; margin: 4px 0 0 0; color: #e11d48; font-weight: 600;">📍 ${poi.distanceMeters}m mesafe</p>
          </div>
        `,
          { closeButton: false, offset: [0, -6] },
        );

        layerGroup.addLayer(marker);
      }
    });
  }, [competitors]);

  useEffect(() => {
    if (!mapRef.current || !listingsLayerGroupRef.current) return;

    import('leaflet').then(({ default: L }) => {
      const layerGroup = listingsLayerGroupRef.current;
      if (!layerGroup) return;

      layerGroup.clearLayers();

      for (const listing of listings) {
        const isSuper = listing.isSuper;
        const listingIcon = L.divIcon({
          className: 'custom-listing-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer">
              <span class="absolute -inset-1.5 rounded-full ${isSuper ? 'bg-rose-500/30' : 'bg-amber-400/40'} animate-ping"></span>
              <div class="flex h-7 w-7 items-center justify-center rounded-full ${isSuper ? 'bg-rose-600 text-white ring-2 ring-rose-300' : 'bg-amber-500 text-white ring-2 ring-amber-200'} shadow-lg transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([listing.lat, listing.lng], {
          icon: listingIcon,
          zIndexOffset: 500,
        });

        marker.bindPopup(
          `
          <div style="font-family: inherit; padding: 4px 6px; min-width: 180px;">
            <span style="display: inline-block; background: ${isSuper ? '#ffe4e6; color: #e11d48' : '#fef3c7; color: #b45309'}; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${listing.tag || listing.categoryLabel}</span>
            <p style="font-weight: 700; font-size: 12px; margin: 4px 0 2px 0; color: #0f172a; line-height: 1.3;">${listing.title}</p>
            ${listing.price ? `<p style="font-size: 12px; font-weight: 800; color: #059669; margin: 2px 0 0 0;">${listing.price}</p>` : ''}
            <a href="${listing.href}" style="display: inline-block; margin-top: 6px; font-size: 11px; font-weight: 700; color: #4f46e5; text-decoration: none;">İlanı Aç ↗</a>
          </div>
        `,
          { closeButton: true, offset: [0, -10] },
        );

        layerGroup.addLayer(marker);
      }
    });
  }, [listings]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm dark:border-zinc-800">
      <div ref={containerRef} className="h-full w-full z-0 min-h-[480px] lg:min-h-[600px]" />
    </div>
  );
}