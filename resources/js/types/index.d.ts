export type {
    KnowledgeDomain,
    Article,
    GlossaryTerm,
    UserArticleProgress,
    UserDomainProgress,
    ProgressStats,
    Diagram,
    SearchResults,
} from './knowledge';

export type {
    PnmCode,
    DecisionTreeNode,
    DecisionTree,
} from './resolve';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at?: string;
    role?: string;
    level?: string;
    onboarding_completed?: boolean;
    created_at: string;
    updated_at: string;
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
