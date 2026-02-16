import { Bot } from 'lucide-react';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ChatTrigger({ onClick }: { onClick: () => void }) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SidebarMenuButton onClick={onClick} className="text-sidebar-accent-foreground">
                            <Bot className="size-4" />
                            <span>Assistant IA</span>
                        </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">Assistant IA PNM</TooltipContent>
                </Tooltip>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
