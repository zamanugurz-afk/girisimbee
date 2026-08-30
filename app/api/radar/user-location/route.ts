import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // 1. Try Vercel Edge / Serverless IP Geolocation headers
    const vercelLat = request.headers.get('x-vercel-ip-latitude');
    const vercelLng = request.headers.get('x-vercel-ip-longitude');
    const vercelCity = request.headers.get('x-vercel-ip-city');

    if (vercelLat && vercelLng) {
      const lat = parseFloat(vercelLat);
      const lng = parseFloat(vercelLng);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        const decodedCity = vercelCity ? decodeURIComponent(vercelCity) : 'Konumunuz';
        return NextResponse.json({
          ok: true,
          source: 'vercel_geo',
          lat,
          lng,
          city: decodedCity,
          locationTitle: `${decodedCity} (Mevcut Konum)`,
        });
      }
    }

    // 2. Fallback: IP-based lookup using client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '';

    if (clientIp && !clientIp.startsWith('127.') && !clientIp.startsWith('192.168.') && clientIp !== '::1') {
      try {
        const res = await fetch(`https://ipwho.is/${clientIp}?lang=tr`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.latitude && data.longitude) {
            return NextResponse.json({
              ok: true,
              source: 'ipwhois',
              lat: data.latitude,
              lng: data.longitude,
              city: data.city || data.region || 'Konumunuz',
              locationTitle: `${data.city || data.region || 'Mevcut Konum'}`,
            });
          }
        }
      } catch {
        // ignore and fallback
      }
    }

    // 3. Default fallback (Istanbul - Kadıköy Moda)
    return NextResponse.json({
      ok: true,
      source: 'default',
      lat: 40.9875,
      lng: 29.0289,
      city: 'İstanbul',
      locationTitle: 'İstanbul, Kadıköy — Moda',
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Konum alınamadı',
      lat: 40.9875,
      lng: 29.0289,
      city: 'İstanbul',
      locationTitle: 'İstanbul, Kadıköy — Moda',
    });
  }
}
