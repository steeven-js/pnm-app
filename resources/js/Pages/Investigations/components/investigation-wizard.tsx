import { useState, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import type { WorkflowDefinition, InvestigationContext, InvestigationState, StepAnalysis } from 'src/lib/investigations';
import { interpolate } from 'src/lib/investigations';

import { CodeBlock } from './code-block';

// ─── Context Panel ──────────────────────────────────────────────────────────

function ContextPanel({ context }: { context: InvestigationContext }) {
  const entries = Object.entries(context).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
          Donnees extraites
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {entries.map(([key, value]) => {
            const display = Array.isArray(value) ? value.join(', ') : (value ?? '');
            if (!display || display.length > 80) return null;
            return (
              <Chip
                key={key}
                label={`${key}: ${display}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 11, maxWidth: 300 }}
              />
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Step Analysis Display ──────────────────────────────────────────────────

function AnalysisDisplay({ analysis }: { analysis: StepAnalysis }) {
  return (
    <Alert severity={analysis.status} sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: analysis.details?.length ? 0.5 : 0 }}>
        {analysis.message}
      </Typography>
      {analysis.details && analysis.details.length > 0 && (
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.25 } }}>
          {analysis.details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </Box>
      )}
    </Alert>
  );
}

// ─── Main Wizard ────────────────────────────────────────────────────────────

type Props = {
  workflow: WorkflowDefinition;
  initialContext: InvestigationContext;
  onReset: () => void;
};

export function InvestigationWizard({ workflow, initialContext, onReset }: Props) {
  const [state, setState] = useState<InvestigationState>({
    workflowId: workflow.id,
    currentStepIndex: 0,
    context: initialContext,
    stepResults: {},
    completedSteps: [],
  });

  const [resultText, setResultText] = useState('');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const currentStep = workflow.steps[state.currentStepIndex];
  if (!currentStep) return null;

  const handleAnalyze = useCallback(() => {
    if (!currentStep.analyzeResult || !resultText.trim()) return;

    const analysis = currentStep.analyzeResult(resultText, state.context);

    // Merge extracted values into context
    const newContext = { ...state.context };
    if (analysis.extractedValues) {
      Object.assign(newContext, analysis.extractedValues);
    }

    setState(prev => ({
      ...prev,
      context: newContext,
      stepResults: {
        ...prev.stepResults,
        [currentStep.id]: { rawOutput: resultText, analysis },
      },
    }));
  }, [currentStep, resultText, state.context]);

  const handleNext = useCallback(() => {
    const analysis = state.stepResults[currentStep.id]?.analysis;

    // Merge any user inputs into context
    const newContext = { ...state.context, ...inputValues };

    // Determine next step
    let nextIndex = state.currentStepIndex + 1;

    if (analysis?.nextStepId) {
      const targetIdx = workflow.steps.findIndex(s => s.id === analysis.nextStepId);
      if (targetIdx >= 0) nextIndex = targetIdx;
    } else if (currentStep.nextStepId) {
      const targetIdx = workflow.steps.findIndex(s => s.id === currentStep.nextStepId);
      if (targetIdx >= 0) nextIndex = targetIdx;
    }

    setState(prev => ({
      ...prev,
      currentStepIndex: Math.min(nextIndex, workflow.steps.length - 1),
      context: newContext,
      completedSteps: [...prev.completedSteps, currentStep.id],
    }));
    setResultText('');
    setInputValues({});
  }, [state, currentStep, inputValues, workflow.steps]);

  const handleBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
    setResultText('');
  }, []);

  const canAdvance = !currentStep.expectsResult || state.stepResults[currentStep.id]?.analysis;
  const isLastStep = state.currentStepIndex === workflow.steps.length - 1;
  const stepAnalysis = state.stepResults[currentStep.id]?.analysis;

  return (
    <Box>
      {/* Context panel */}
      <ContextPanel context={state.context} />

      {/* Stepper */}
      <Stepper activeStep={state.currentStepIndex} alternativeLabel sx={{ mb: 4 }}>
        {workflow.steps.map((step, idx) => (
          <Step key={step.id} completed={state.completedSteps.includes(step.id)}>
            <StepLabel
              optional={idx === state.currentStepIndex ? (
                <Typography variant="caption" color="primary">{step.title}</Typography>
              ) : undefined}
            >
              {step.title}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Current step content */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Step header */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: '50%',
                bgcolor: 'primary.main', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: 16, flexShrink: 0,
              }}
            >
              {state.currentStepIndex + 1}
            </Box>
            <Iconify icon={currentStep.icon} width={24} sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">{currentStep.title}</Typography>
              <Typography variant="body2" color="text.secondary">{currentStep.description}</Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* User inputs */}
          {currentStep.inputs && currentStep.inputs.length > 0 && (
            <Stack spacing={2} sx={{ mb: 2 }}>
              {currentStep.inputs.map(input => (
                <TextField
                  key={input.key}
                  label={input.label}
                  placeholder={input.placeholder}
                  value={inputValues[input.key] ?? state.context[input.key] ?? ''}
                  onChange={e => setInputValues(prev => ({ ...prev, [input.key]: e.target.value }))}
                  size="small"
                  fullWidth
                />
              ))}
            </Stack>
          )}

          {/* Commands */}
          {currentStep.commands && currentStep.commands.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {currentStep.commands.map((cmd, idx) => (
                <CodeBlock
                  key={idx}
                  label={cmd.label}
                  server={cmd.server}
                  type={cmd.type}
                >
                  {interpolate(cmd.template, { ...state.context, ...inputValues })}
                </CodeBlock>
              ))}
            </Box>
          )}

          {/* Result textarea */}
          {currentStep.expectsResult && (
            <Box sx={{ mt: 2 }}>
              <TextField
                multiline
                minRows={4}
                maxRows={12}
                fullWidth
                placeholder={currentStep.resultPlaceholder ?? 'Collez ici le resultat...'}
                value={resultText}
                onChange={e => setResultText(e.target.value)}
                sx={{
                  '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 13 },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={!resultText.trim() || !currentStep.analyzeResult}
                startIcon={<Iconify icon="solar:magnifer-bold-duotone" width={18} />}
                sx={{ mt: 1 }}
              >
                Analyser le resultat
              </Button>
            </Box>
          )}

          {/* Analysis result */}
          <Collapse in={!!stepAnalysis}>
            {stepAnalysis && <AnalysisDisplay analysis={stepAnalysis} />}
          </Collapse>

          {/* Tips */}
          {currentStep.tips && currentStep.tips.length > 0 && (
            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" width={22} />} sx={{ mt: 2 }}>
              <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.25 } }}>
                {currentStep.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </Box>
            </Alert>
          )}

          {/* Navigation */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={state.currentStepIndex === 0}
              startIcon={<Iconify icon="solar:arrow-left-linear" width={18} />}
            >
              Precedent
            </Button>

            <Stack direction="row" spacing={1}>
              <Button variant="text" color="inherit" onClick={onReset}>
                Recommencer
              </Button>
              {!isLastStep && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canAdvance}
                  endIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
                >
                  Suivant
                </Button>
              )}
              {isLastStep && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={onReset}
                  startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}
                >
                  Terminer
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
