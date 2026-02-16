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
import { type FilenameResult, decodeFilename } from '@/lib/pnm-utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vérifier', href: '/verify' },
    { title: 'Décodeur fichier PNMDATA', href: '/verify/filename-decoder' },
];

export default function FilenameDecoder() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<FilenameResult | null>(null);

    function decode() {
        if (!input.trim()) return;
        setResult(decodeFilename(input.trim()));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Décodeur fichier PNMDATA" />
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
                        Décodeur de nom de fichier PNMDATA
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Décodez un nom de fichier PNMDATA pour en extraire les
                        informations.
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
                            Nom du fichier
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
                                placeholder="Ex : PNMDATA.02.01.20260216093000.001"
                                size="small"
                                sx={{ flex: 1 }}
                                onKeyDown={(e) => e.key === 'Enter' && decode()}
                            />
                            <Button
                                variant="contained"
                                onClick={decode}
                                disabled={!input.trim()}
                            >
                                Décoder
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {result && !result.valid && (
                    <Alert severity="error">{result.error}</Alert>
                )}

                {result && result.valid && (
                    <>
                        <Alert severity="success">Nom de fichier valide</Alert>

                        <Card sx={{ borderLeft: 3, borderColor: '#f59e0b' }}>
                            <CardContent>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    Informations décodées
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '160px 1fr',
                                        gap: 1,
                                        alignItems: 'baseline',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Préfixe
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {result.prefix}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Opérateur source
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {result.sourceOperator} —{' '}
                                        {result.sourceOperatorName}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Opérateur destination
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {result.destOperator} —{' '}
                                        {result.destOperatorName}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Date / heure
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {result.formattedDate}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Timestamp brut
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{ fontFamily: 'monospace' }}
                                    >
                                        {result.timestamp}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        N° de séquence
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{ fontFamily: 'monospace' }}
                                    >
                                        {result.sequence}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </>
                )}
            </Box>
        </AppLayout>
    );
}
