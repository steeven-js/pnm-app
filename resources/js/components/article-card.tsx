import { Link } from '@inertiajs/react';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import type { Article } from '@/types';

type ArticleCardProps = {
    article: Article;
    domainSlug: string;
    isRead?: boolean;
};

export function ArticleCard({ article, domainSlug, isRead }: ArticleCardProps) {
    return (
        <Link
            href={`/knowledge/${domainSlug}/${article.slug}`}
            className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
        >
            <div className="shrink-0">
                {isRead ? (
                    <CheckCircle2 className="size-5 text-green-500" />
                ) : (
                    <FileText className="text-muted-foreground size-5" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{article.title}</p>
                {article.excerpt && (
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">{article.excerpt}</p>
                )}
            </div>
            <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                <Clock className="size-3" />
                <span>{article.reading_time_minutes} min</span>
            </div>
        </Link>
    );
}
