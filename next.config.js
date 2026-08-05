/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: '/franchise', destination: '/franchise/buy', permanent: false },
      { source: '/hesabim', destination: '/dashboard', permanent: false },
      { source: '/hesabim/profilim', destination: '/dashboard/profil', permanent: false },
      { source: '/hesabim/guvenlik', destination: '/dashboard/guvenlik', permanent: false },
      { source: '/hesabim/ilanlarim', destination: '/dashboard/ilanlarim', permanent: false },
      { source: '/hesabim/favorilerim', destination: '/dashboard/favorilerim', permanent: false },
      { source: '/hesabim/bildirimlerim', destination: '/dashboard/bildirimlerim', permanent: false },
      { source: '/hesabim/odemelerim', destination: '/dashboard/odemelerim', permanent: false },
      { source: '/hesabim/ayarlar', destination: '/dashboard/ayarlar', permanent: false },
      { source: '/hesabim/vitrinlerim', destination: '/dashboard/paketlerim', permanent: false },
      { source: '/mesajlar', destination: '/dashboard', permanent: false },
      { source: '/mesajlar/:path*', destination: '/dashboard', permanent: false },
      { source: '/dashboard/mesajlarim', destination: '/dashboard', permanent: false },
      { source: '/bildirimler', destination: '/dashboard/bildirimlerim', permanent: false },
      { source: '/favoriler', destination: '/dashboard/favorilerim', permanent: false },
      { source: '/ilanlarim', destination: '/dashboard/ilanlarim', permanent: false },
      { source: '/ayarlar', destination: '/dashboard/ayarlar', permanent: false },
    ];
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /node_modules\/@supabase\/supabase-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
};

module.exports = nextConfig;
