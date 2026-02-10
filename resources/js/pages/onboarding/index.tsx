import { Head, router } from '@inertiajs/react';
import { Code2, Headphones, MonitorCog, Network, Users } from 'lucide-react';
import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

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
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-transparent to-gray-50 p-4 dark:to-gray-950">
                <div className="w-full max-w-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold">Bienvenue sur PNM Knowledge</h1>
                        <p className="text-muted-foreground mt-2">
                            Pour personnaliser votre expérience, sélectionnez votre rôle
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.value;

                            return (
                                <button
                                    key={role.value}
                                    onClick={() => handleSelect(role.value)}
                                    disabled={submitting}
                                    className="text-left disabled:opacity-50"
                                >
                                    <Card
                                        className={`group transition-all hover:shadow-md hover:-translate-y-0.5 ${
                                            isSelected ? 'ring-primary ring-2' : ''
                                        }`}
                                    >
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div
                                                className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                                                style={{
                                                    backgroundColor: `${role.color}15`,
                                                    color: role.color,
                                                }}
                                            >
                                                <Icon className="size-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm">
                                                    {role.title}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    {role.description}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
