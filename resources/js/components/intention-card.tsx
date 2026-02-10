import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type IntentionCardProps = {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color: string;
    disabled?: boolean;
};

export function IntentionCard({ title, description, icon: Icon, href, color, disabled }: IntentionCardProps) {
    const content = (
        <Card
            className={`group relative overflow-hidden transition-all ${
                disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
            }`}
        >
            <div className="absolute inset-0 opacity-5" style={{ backgroundColor: color }} />
            <CardHeader className="flex flex-row items-center gap-4">
                <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${color}15`, color }}
                >
                    <Icon className="size-6" />
                </div>
                <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription className="text-xs">{description}</CardDescription>
                </div>
            </CardHeader>
            {disabled && (
                <div className="absolute top-2 right-2">
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]">
                        Phase 2
                    </span>
                </div>
            )}
        </Card>
    );

    if (disabled) return content;

    return (
        <Link href={href} className="block">
            {content}
        </Link>
    );
}
