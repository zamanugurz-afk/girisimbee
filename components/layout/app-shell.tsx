'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { motion } from 'framer-motion';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <motion.main
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 px-4 py-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </motion.main>
      </div>

      <CommandPalette />
    </div>
  );
}
