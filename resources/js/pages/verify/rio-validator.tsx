import { Head } from '@inertiajs/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type RioResult, validateRio } from '@/lib/pnm-utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vérifier', href: '/verify' },
    { title: 'Validateur de RIO', href: '/verify/rio-validator' },
];

export default function RioValidator() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<RioResult | null>(null);

    function validate() {
        if (!input.trim()) return;
        setResult(validateRio(input.trim()));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Validateur de RIO" />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    p: 2,
                    maxWidth: 720,
                }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Validateur de RIO
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Validez et décodez un Relevé d'Identité Opérateur
                        (format OO-Q-RRRRRR-CCC).
                    </Typography>
                </Box>

                <Card>
                    <CardContent
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <Typography variant="subtitle2" color="text.secondary">
                            RIO
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                alignItems: 'flex-start',
                            }}
                        >
                            <TextField
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ex : 02-1-123456-789 ou 021123456789"
                                size="small"
                                sx={{ flex: 1 }}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && validate()
                                }
                            />
                            <Button
                                variant="contained"
                                onClick={validate}
                                disabled={!input.trim()}
                            >
                                Valider
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {result && !result.valid && (
                    <Alert severity="error">{result.error}</Alert>
                )}

                {result && result.valid && (
                    <>
                        <Alert severity="success">RIO valide</Alert>

                        <Card sx={{ borderLeft: 3, borderColor: '#8b5cf6' }}>
                            <CardContent>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    Décodage
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '140px 1fr',
                                        gap: 1,
                                        alignItems: 'baseline',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Opérateur (OO)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {result.operator} —{' '}
                                        {result.operatorName}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Qualifiant (Q)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {result.qualifier}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Référence (R×6)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{ fontFamily: 'monospace' }}
                                    >
                                        {result.reference}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Clé contrôle (C×3)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{ fontFamily: 'monospace' }}
                                    >
                                        {result.controlKey}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    RIO formaté
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ fontFamily: 'monospace' }}
                                >
                                    {result.operator}-{result.qualifier}-
                                    {result.reference}-{result.controlKey}
                                </Typography>
                            </CardContent>
                        </Card>
                    </>
                )}
            </Box>
        </AppLayout>
    );
}
