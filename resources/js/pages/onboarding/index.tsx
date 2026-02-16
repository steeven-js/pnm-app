import { Head, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Code2, Headphones, MonitorCog, Network, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

type RoleOption = {
    value: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
};

const roles: RoleOption[] = [
    {
        value: 'charge_application',
        title: "Chargé d'Application",
        description: "Responsable des applications PNM, PortaDB et des processus de portabilité",
        icon: MonitorCog,
        color: '#3b82f6',
    },
    {
        value: 'developpeur',
        title: 'Développeur',
        description: "Développement et maintenance des systèmes SI et intégrations",
        icon: Code2,
        color: '#8b5cf6',
    },
    {
        value: 'reseau',
        title: 'Ingénieur Réseau',
        description: "Architecture réseau, Core Network, routage et interconnexions",
        icon: Network,
        color: '#10b981',
    },
    {
        value: 'support',
        title: 'Support',
        description: "Support technique, résolution d'incidents et accompagnement utilisateurs",
        icon: Headphones,
        color: '#f59e0b',
    },
    {
        value: 'manager',
        title: 'Manager',
        description: "Vision globale de l'architecture et pilotage des équipes",
        icon: Users,
        color: '#ef4444',
    },
];

export default function Onboarding() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSelect = (role: string) => {
        setSelectedRole(role);
        setSubmitting(true);
        router.post('/onboarding', { role }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Bienvenue" />
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: (t) =>
                        t.palette.mode === 'dark'
                            ? 'linear-gradient(to bottom, transparent, #030712)'
                            : 'linear-gradient(to bottom, transparent, #f9fafb)',
                    p: 2,
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 672 }}>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight={700}>
                            Bienvenue sur PNM Knowledge
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Pour personnaliser votre expérience, sélectionnez votre rôle
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { sm: 'repeat(2, 1fr)' } }}>
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.value;

                            return (
                                <Card
                                    key={role.value}
                                    component="button"
                                    onClick={() => handleSelect(role.value)}
                                    disabled={submitting}
                                    sx={{
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                        transition: 'all 0.2s',
                                        '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                                        '&:disabled': { opacity: 0.5 },
                                        ...(isSelected && { boxShadow: (t) => `0 0 0 2px ${t.palette.primary.main}` }),
                                    }}
                                >
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                width: 40,
                                                height: 40,
                                                flexShrink: 0,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 2,
                                                bgcolor: `${role.color}15`,
                                                color: role.color,
                                            }}
                                        >
                                            <Icon size={20} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {role.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {role.description}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </>
    );
}
