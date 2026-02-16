import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpenText,
    Calculator,
    Calendar,
    FileSearch,
    GitBranch,
    Hash,
    LayoutGrid,
    Phone,
    Search,
    ShieldCheck,
    Workflow,
} from 'lucide-react';
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

const navItems: NavItem[] = [
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
];

const toolsItems: NavItem[] = [
    {
        title: 'Vérifier',
        href: '/verify',
        icon: Calculator,
        children: [
            { title: 'Calculateur de dates', href: '/verify/date-calculator', icon: Calendar },
            { title: 'Validateur de RIO', href: '/verify/rio-validator', icon: ShieldCheck },
            { title: 'Analyseur fichier PNM', href: '/verify/filename-decoder', icon: FileSearch },
            { title: 'Calculateur ID portage', href: '/verify/portage-id', icon: Hash },
            { title: 'Vérificateur MSISDN', href: '/verify/msisdn-checker', icon: Phone },
        ],
    },
    {
        title: 'Résoudre',
        href: '/resolve',
        icon: Search,
        children: [
            { title: 'Dictionnaire des codes', href: '/resolve/codes', icon: BookOpenText },
            { title: 'Arbres de décision', href: '/resolve/decision-trees', icon: GitBranch },
        ],
    },
    {
        title: 'Diagrammes',
        href: '/diagrams',
        icon: Workflow,
    },
];

const referenceItems: NavItem[] = [
    {
        title: 'Glossaire',
        href: '/glossary',
        icon: BookOpenText,
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
                <NavMain items={navItems} label="Navigation" />
                <NavMain items={toolsItems} label="Outils PNM" />
                <NavMain items={referenceItems} label="Référence" />
                <NavKnowledge />
            </SidebarContent>

            <SidebarFooter>
                {onChatOpen && <ChatTrigger onClick={onChatOpen} />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
