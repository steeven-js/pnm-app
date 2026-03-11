import { useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { WorkflowDefinition, InvestigationContext } from 'src/lib/investigations';
import { WORKFLOWS, detectWorkflow } from 'src/lib/investigations';

import { InvestigationWizard } from './components/investigation-wizard';

// ─── Landing: Workflow picker + email paste ─────────────────────────────────

function WorkflowPicker({
  onStart,
}: {
  onStart: (workflow: WorkflowDefinition, context: InvestigationContext) => void;
}) {
  const [emailText, setEmailText] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [parseError, setParseError] = useState('');
  const [detectedContext, setDetectedContext] = useState<InvestigationContext | null>(null);

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmailText(text);
      setParseError('');
      setDetectedContext(null);

      if (text.trim().length > 20) {
        const detected = detectWorkflow(text);
        if (detected) {
          setSelectedWorkflow(detected);
          const ctx = detected.parseEmail(text);
          if (ctx) setDetectedContext(ctx);
        }
      }
    },
    []
  );

  const handleStart = useCallback(() => {
    if (!selectedWorkflow) {
      setParseError('Selectionnez un type d\'investigation ou collez un email pour la detection automatique.');
      return;
    }

    let context: InvestigationContext = {};

    if (emailText.trim()) {
      const parsed = selectedWorkflow.parseEmail(emailText);
      if (parsed) {
        context = parsed;
      }
    }

    // Merge detected context
    if (detectedContext) {
      context = { ...detectedContext, ...context };
    }

    onStart(selectedWorkflow, context);
  }, [selectedWorkflow, emailText, detectedContext, onStart]);

  return (
    <Box>
      {/* Workflow cards */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Type d'investigation
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          mb: 4,
        }}
      >
        {WORKFLOWS.map((wf) => {
          const isSelected = selectedWorkflow?.id === wf.id;
          return (
            <Card
              key={wf.id}
              variant={isSelected ? 'elevation' : 'outlined'}
              sx={{
                borderColor: isSelected ? wf.color : undefined,
                borderWidth: isSelected ? 2 : 1,
                boxShadow: isSelected ? 4 : 0,
                transition: 'all 0.2s',
              }}
            >
              <CardActionArea onClick={() => setSelectedWorkflow(wf)}>
                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${wf.color}15`,
                      color: wf.color,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={wf.icon} width={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {wf.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {wf.description}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                      {wf.emailSubjects.slice(0, 3).map((s) => (
                        <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                      ))}
                      {wf.emailSubjects.length > 3 && (
                        <Chip label={`+${wf.emailSubjects.length - 3}`} size="small" sx={{ fontSize: 10 }} />
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {/* Email paste area */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Email d'incident
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Collez le contenu de l'email pour extraire automatiquement les informations (MSISDN, fichiers, operateurs,
        dates...). La detection du type d'investigation est automatique.
      </Typography>

      <TextField
        multiline
        minRows={6}
        maxRows={16}
        fullWidth
        placeholder={
          'Collez ici le contenu de l\'email...\n\nExemple :\n[PNM][INCIDENT] Incidents detectes\nMSISDN : 0696XXXXXX\nFichier : PNMDATA.04.02.20260310...'
        }
        value={emailText}
        onChange={(e) => handleEmailChange(e.target.value)}
        sx={{
          mb: 2,
          '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 13 },
        }}
      />

      {/* Detection feedback */}
      {detectedContext && selectedWorkflow && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Type detecte : {selectedWorkflow.title}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {Object.entries(detectedContext)
              .filter(([, v]) => v && (typeof v === 'string' ? v.length < 40 : true))
              .slice(0, 8)
              .map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${Array.isArray(value) ? value.join(', ') : value}`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: 11 }}
                />
              ))}
          </Stack>
        </Alert>
      )}

      {parseError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {parseError}
        </Alert>
      )}

      {/* Start button */}
      <Button
        variant="contained"
        size="large"
        onClick={handleStart}
        disabled={!selectedWorkflow}
        startIcon={<Iconify icon="solar:play-bold" width={20} />}
        sx={{ minWidth: 200 }}
      >
        Demarrer l'investigation
      </Button>
    </Box>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function InvestigationsIndex() {
  const [activeInvestigation, setActiveInvestigation] = useState<{
    workflow: WorkflowDefinition;
    context: InvestigationContext;
  } | null>(null);

  const handleStart = useCallback((workflow: WorkflowDefinition, context: InvestigationContext) => {
    setActiveInvestigation({ workflow, context });
  }, []);

  const handleReset = useCallback(() => {
    setActiveInvestigation(null);
  }, []);

  return (
    <DashboardLayout>
      <Head title="Investigations" />

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          {activeInvestigation && (
            <Button
              variant="text"
              color="inherit"
              onClick={handleReset}
              startIcon={<Iconify icon="solar:arrow-left-linear" width={18} />}
              sx={{ mr: 1 }}
            >
              Retour
            </Button>
          )}
          <Box>
            <Typography variant="h4">
              {activeInvestigation ? activeInvestigation.workflow.title : 'Investigations'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {activeInvestigation
                ? 'Investigation en cours — suivez les etapes'
                : 'Demarrez une investigation a partir d\'un email PNM'}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: 3 }}>
          {activeInvestigation ? (
            <InvestigationWizard
              workflow={activeInvestigation.workflow}
              initialContext={activeInvestigation.context}
              onReset={handleReset}
            />
          ) : (
            <WorkflowPicker onStart={handleStart} />
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
