import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { KnowledgeDomain, SharedData } from '@/types';

const domainIcons: Record<string, string> = {
    'pnm-v3': '📱',
    'systemes-information': '💻',
    'reseau-infrastructure': '🌐',
    'inter-operateurs-gpmag': '🤝',
    'outils-scripts': '🔧',
};

export function NavKnowledge() {
    const { knowledgeDomains } = usePage<SharedData>().props;
    const { isCurrentUrl } = useCurrentUrl();

    if (!knowledgeDomains || knowledgeDomains.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Base de connaissances</SidebarGroupLabel>
            <SidebarMenu>
                <Collapsible defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                isActive={isCurrentUrl('/knowledge')}
                                tooltip={{ children: 'Connaissances' }}
                            >
                                <BookOpen className="size-4" />
                                <span>Connaissances</span>
                                <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {knowledgeDomains.map((domain: KnowledgeDomain) => (
                                    <SidebarMenuSubItem key={domain.id}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={isCurrentUrl(`/knowledge/${domain.slug}`)}
                                        >
                                            <Link href={`/knowledge/${domain.slug}`} prefetch>
                                                <span>{domainIcons[domain.slug] || '📖'}</span>
                                                <span>{domain.name}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}
