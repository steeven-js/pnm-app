import { useState } from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { ChatPanel } from '@/components/chat-panel';
import { SpotlightSearch } from '@/components/spotlight-search';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <AppShell variant="sidebar">
            <AppSidebar onChatOpen={() => setChatOpen(true)} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <SpotlightSearch />
            <ChatPanel open={chatOpen} onOpenChange={setChatOpen} />
        </AppShell>
    );
}
