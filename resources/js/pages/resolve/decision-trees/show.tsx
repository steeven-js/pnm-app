import { Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DecisionTreePlayer } from '@/components/decision-tree-player';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, DecisionTree } from '@/types';

type Props = {
    tree: DecisionTree;
};

export default function DecisionTreeShow({ tree }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Résoudre', href: '/resolve' },
        { title: 'Arbres de décision', href: '/resolve/decision-trees' },
        { title: tree.title, href: `/resolve/decision-trees/${tree.slug}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tree.title} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2, maxWidth: 720 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        {tree.icon && (
                            <Typography variant="h5" component="span">
                                {tree.icon}
                            </Typography>
                        )}
                        <Typography variant="h5" fontWeight={700}>
                            {tree.title}
                        </Typography>
                    </Box>
                    {tree.description && (
                        <Typography variant="body2" color="text.secondary">
                            {tree.description}
                        </Typography>
                    )}
                </Box>

                <DecisionTreePlayer rootNode={tree.tree_data} />
            </Box>
        </AppLayout>
    );
}
