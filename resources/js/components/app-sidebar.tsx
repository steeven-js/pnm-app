import { Link } from '@inertiajs/react';
import { BarChart3, BookOpenText, Calculator, LayoutGrid, Search, Workflow } from 'lucide-react';
import { ChatTrigger } from '@/components/chat-trigger';
import { NavKnowledge } from '@/components/nav-knowledge';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Progression',
        href: '/progress',
        icon: BarChart3,
    },
    {
        title: 'Glossaire',
        href: '/glossary',
        icon: BookOpenText,
    },
    {
        title: 'Résoudre',
        href: '/resolve',
        icon: Search,
    },
    {
        title: 'Vérifier',
        href: '/verify',
        icon: Calculator,
    },
    {
        title: 'Diagrammes',
        href: '/diagrams',
        icon: Workflow,
    },
];

export function AppSidebar({ onChatOpen }: { onChatOpen?: () => void }) {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavKnowledge />
            </SidebarContent>

            <SidebarFooter>
                {onChatOpen && <ChatTrigger onClick={onChatOpen} />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
