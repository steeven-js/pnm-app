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

export interface Article {
  id: number;
  domain_id: number;
  parent_id: number | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  level: 'decouverte' | 'comprehension' | 'maitrise';
  sort_order: number;
  reading_time_minutes: number;
  is_published: boolean;
}

export interface GlossaryTerm {
  id: number;
  term: string;
  slug: string;
  abbreviation: string | null;
  definition: string;
  category: string | null;
}

export interface UserArticleProgress {
  id: number;
  user_id: number;
  article_id: number;
  is_read: boolean;
  quiz_score: number | null;
  read_at: string | null;
}

export interface UserDomainProgress {
  id: number;
  user_id: number;
  domain_id: number;
  articles_read: number;
  articles_total: number;
  completion_percentage: number;
}

export interface PnmCode {
  id: number;
  code: string;
  category: string;
  subcategory: string | null;
  label: string;
  description: string;
  probable_cause: string | null;
  recommended_action: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  sort_order: number;
}

export interface DecisionTree {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  tree_data: Record<string, any>;
  sort_order: number;
}
