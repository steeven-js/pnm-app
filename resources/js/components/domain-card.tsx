import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { KnowledgeDomain, UserDomainProgress } from '@/types';

const domainIcons: Record<string, string> = {
    'pnm-v3': '📱',
    'systemes-information': '💻',
    'reseau-infrastructure': '🌐',
    'inter-operateurs-gpmag': '🤝',
    'outils-scripts': '🔧',
};

type DomainCardProps = {
    domain: KnowledgeDomain;
    progress?: UserDomainProgress;
    showProgress?: boolean;
};

export function DomainCard({ domain, progress, showProgress = true }: DomainCardProps) {
    const percentage = progress?.completion_percentage ?? 0;

    return (
        <Link href={`/knowledge/${domain.slug}`} className="block">
            <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
                <div
                    className="absolute top-0 left-0 h-1 w-full"
                    style={{ backgroundColor: domain.color || '#6b7280' }}
                />
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{domainIcons[domain.slug] || '📖'}</span>
                        <div>
                            <CardTitle className="text-sm">{domain.name}</CardTitle>
                            <CardDescription className="text-xs">
                                {domain.articles_count || 0} articles
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                {showProgress && (
                    <CardContent className="pt-0">
                        <div className="flex items-center gap-2">
                            <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: domain.color || '#6b7280',
                                    }}
                                />
                            </div>
                            <span className="text-muted-foreground text-xs">{Math.round(percentage)}%</span>
                        </div>
                    </CardContent>
                )}
            </Card>
        </Link>
    );
}
