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

export interface DecisionTreeNode {
  id: string;
  type: 'question' | 'diagnosis';
  text: string;
  // Question nodes
  yes?: DecisionTreeNode;
  no?: DecisionTreeNode;
  // Diagnosis nodes
  diagnosis?: string;
  recommended_action?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  sql_query?: string;
  related_codes?: string[];
}

export interface DecisionTree {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  tree_data: DecisionTreeNode;
  sort_order: number;
}
