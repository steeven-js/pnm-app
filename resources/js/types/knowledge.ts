export type KnowledgeDomain = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    sort_order: number;
    articles_count?: number;
    created_at: string;
    updated_at: string;
};

export type Article = {
    id: number;
    domain_id: number;
    parent_id: number | null;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    level: string;
    sort_order: number;
    reading_time_minutes: number;
    is_published: boolean;
    domain?: KnowledgeDomain;
    parent?: Article | null;
    children?: Article[];
    glossary_terms?: GlossaryTerm[];
    created_at: string;
    updated_at: string;
};

export type GlossaryTerm = {
    id: number;
    term: string;
    slug: string;
    abbreviation: string | null;
    definition: string;
    category: string | null;
    created_at: string;
    updated_at: string;
};

export type UserArticleProgress = {
    id: number;
    user_id: number;
    article_id: number;
    is_read: boolean;
    quiz_score: number | null;
    read_at: string | null;
    article?: Article;
};

export type UserDomainProgress = {
    id: number;
    user_id: number;
    domain_id: number;
    articles_read: number;
    articles_total: number;
    completion_percentage: number;
};

export type ProgressStats = {
    totalArticles: number;
    totalRead: number;
    completionPercentage: number;
    level: string;
};

export type Diagram = {
    id: number;
    title: string;
    mermaid_source: string;
    article: Pick<Article, 'id' | 'title' | 'slug'>;
    domain: Pick<KnowledgeDomain, 'id' | 'name' | 'slug' | 'color'>;
};

export type SearchResults = {
    articles: (Pick<Article, 'id' | 'title' | 'slug' | 'excerpt' | 'level'> & {
        domain: Pick<KnowledgeDomain, 'id' | 'slug' | 'name' | 'color'>;
    })[];
    glossary: Pick<GlossaryTerm, 'id' | 'term' | 'slug' | 'abbreviation' | 'definition' | 'category'>[];
};
