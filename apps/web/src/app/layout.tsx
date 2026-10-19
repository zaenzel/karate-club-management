import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { AppHeader } from '@/components/layout/app-header';
import { siteConfig } from '@/config/site';
import { AppProviders } from '@/providers/app-providers';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppProviders>
          <AppHeader />
          <main className="flex-1">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
