export type { WorkflowDefinition, InvestigationContext, InvestigationState, StepAnalysis, WorkflowStep, CommandTemplate } from './types';
export { interpolate } from './types';

import { incidentWorkflow } from './incident-workflow';
import { vacationWorkflow } from './vacation-workflow';

export const WORKFLOWS = [incidentWorkflow, vacationWorkflow];

/** Detect workflow from email text */
export function detectWorkflow(emailText: string) {
  for (const wf of WORKFLOWS) {
    for (const subject of wf.emailSubjects) {
      if (emailText.includes(subject)) return wf;
    }
  }
  // Fallback: try regex patterns
  if (/\[PNM\]\s*\[?\s*INCIDENT/i.test(emailText)) return incidentWorkflow;
  if (/vacation/i.test(emailText)) return vacationWorkflow;
  return null;
}
