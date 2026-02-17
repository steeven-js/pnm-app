export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: string;
    level?: string;
    onboarding_completed?: boolean;
}

export interface KnowledgeDomain {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    sort_order: number;
    articles_count?: number;
}

export interface DomainProgress {
    id: number;
    user_id: number;
    domain_id: number;
    articles_read: number;
    articles_total: number;
    completion_percentage: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    knowledgeDomains: KnowledgeDomain[];
};
