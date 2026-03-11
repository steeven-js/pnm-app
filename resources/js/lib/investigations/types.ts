// ─── Investigation Workflow Types ────────────────────────────────────────────

/** Values extracted from email or user input, passed between steps */
export type InvestigationContext = Record<string, string | string[] | undefined>;

/** Template for an SSH or SQL command */
export type CommandTemplate = {
  type: 'ssh' | 'sql';
  label: string;
  server?: string;
  /** Use {{variable}} syntax for interpolation */
  template: string;
};

/** Result of analyzing pasted command output */
export type StepAnalysis = {
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string[];
  /** Values to merge into context for subsequent steps */
  extractedValues?: Record<string, string | string[]>;
  /** Override next step (conditional routing) */
  nextStepId?: string;
};

/** A single step in an investigation workflow */
export type WorkflowStep = {
  id: string;
  title: string;
  icon: string;
  description: string;
  /** Commands to display (interpolated with context) */
  commands?: CommandTemplate[];
  /** Whether the user needs to paste a result */
  expectsResult?: boolean;
  /** Placeholder for the result textarea */
  resultPlaceholder?: string;
  /** Function to analyze pasted result */
  analyzeResult?: (output: string, context: InvestigationContext) => StepAnalysis;
  /** Tips displayed below the step */
  tips?: string[];
  /** ID of the next step (if not sequential) */
  nextStepId?: string;
  /** User input fields to collect (besides the result textarea) */
  inputs?: WorkflowInput[];
};

/** A user input field within a step */
export type WorkflowInput = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
};

/** Complete workflow definition */
export type WorkflowDefinition = {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  /** Email subjects that trigger this workflow */
  emailSubjects: string[];
  /** Parse email body and extract initial context */
  parseEmail: (emailText: string) => InvestigationContext | null;
  /** Ordered steps */
  steps: WorkflowStep[];
};

/** Runtime state of an active investigation */
export type InvestigationState = {
  workflowId: string;
  currentStepIndex: number;
  context: InvestigationContext;
  stepResults: Record<string, {
    rawOutput: string;
    analysis: StepAnalysis;
  }>;
  completedSteps: string[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Interpolate {{variable}} in a command template */
export function interpolate(template: string, context: InvestigationContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = context[key];
    if (Array.isArray(val)) return val[0] ?? `<${key}>`;
    return val ?? `<${key}>`;
  });
}
