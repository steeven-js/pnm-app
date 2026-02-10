import { Head, Link } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, Trophy } from 'lucide-react';
import { LevelBadge } from '@/components/level-badge';
import { ProgressBar } from '@/components/progress-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type {
    BreadcrumbItem,
    KnowledgeDomain,
    ProgressStats,
    UserArticleProgress,
    UserDomainProgress,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Progression', href: '/progress' },
];

type Props = {
    domains: KnowledgeDomain[];
    domainProgress: Record<number, UserDomainProgress>;
    recentlyRead: (UserArticleProgress & {
        article: {
            id: number;
            title: string;
            slug: string;
            domain_id: number;
            reading_time_minutes: number;
            domain: { id: number; slug: string; name: string; color: string };
        };
    })[];
    stats: ProgressStats;
};

export default function Progress({ domains, domainProgress, recentlyRead, stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Progression" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Ma progression</h1>
                    <p className="text-muted-foreground text-sm">Suivez votre avancement</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                                <BookOpen className="size-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalRead}</p>
                                <p className="text-muted-foreground text-xs">Articles lus</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                                <CheckCircle2 className="size-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.completionPercentage}%</p>
                                <p className="text-muted-foreground text-xs">Complété</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
                                <Trophy className="size-5 text-purple-500" />
                            </div>
                            <div>
                                <LevelBadge level={stats.level} />
                                <p className="text-muted-foreground mt-0.5 text-xs">Niveau actuel</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
                                <Clock className="size-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalArticles}</p>
                                <p className="text-muted-foreground text-xs">Articles disponibles</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Progression par domaine</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {domains.map((domain) => {
                            const progress = domainProgress[domain.id];
                            return (
                                <div key={domain.id}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <Link
                                            href={`/knowledge/${domain.slug}`}
                                            className="hover:underline"
                                        >
                                            {domain.name}
                                        </Link>
                                        <span className="text-muted-foreground text-xs">
                                            {progress?.articles_read || 0}/{domain.articles_count || 0}
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={progress?.completion_percentage ?? 0}
                                        color={domain.color || '#6b7280'}
                                    />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {recentlyRead.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Articles récemment lus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {recentlyRead.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/knowledge/${item.article.domain.slug}/${item.article.slug}`}
                                        className="hover:bg-accent/50 flex items-center justify-between rounded-lg px-3 py-2 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-green-500" />
                                            <span className="text-sm">{item.article.title}</span>
                                        </div>
                                        <span
                                            className="rounded px-1.5 py-0.5 text-[10px] text-white"
                                            style={{
                                                backgroundColor: item.article.domain.color || '#6b7280',
                                            }}
                                        >
                                            {item.article.domain.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
