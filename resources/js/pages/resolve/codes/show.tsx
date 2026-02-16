import { Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { SeverityBadge } from '@/components/severity-badge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PnmCode } from '@/types';

type Props = {
    code: PnmCode;
};

export default function CodeShow({ code }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Résoudre', href: '/resolve' },
        { title: 'Codes PNM', href: '/resolve/codes' },
        { title: code.code, href: `/resolve/codes/${code.code}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${code.code} — ${code.label}`} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2, maxWidth: 720 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Typography
                            variant="h5"
                            sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
                        >
                            {code.code}
                        </Typography>
                        <SeverityBadge severity={code.severity} size="medium" />
                        <Chip label={code.category} size="small" variant="outlined" />
                        {code.subcategory && <Chip label={code.subcategory} size="small" variant="outlined" />}
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                        {code.label}
                    </Typography>
                </Box>

                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Description
                        </Typography>
                        <Typography variant="body2">
                            {code.description}
                        </Typography>
                    </CardContent>
                </Card>

                {code.probable_cause && (
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Cause probable
                            </Typography>
                            <Typography variant="body2">
                                {code.probable_cause}
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {code.recommended_action && (
                    <Card sx={{ borderLeft: 3, borderColor: 'primary.main' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Action recommandée
                            </Typography>
                            <Typography variant="body2">
                                {code.recommended_action}
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </AppLayout>
    );
}
