import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, GlossaryTerm } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Glossaire', href: '/glossary' },
];

type Props = {
    terms: GlossaryTerm[];
    categories: string[];
    filters: { q: string | null; category: string | null };
};

export default function GlossaryIndex({ terms, categories, filters }: Props) {
    const grouped = terms.reduce<Record<string, GlossaryTerm[]>>((acc, term) => {
        const letter = term.term[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(term);
        return acc;
    }, {});

    const sortedLetters = Object.keys(grouped).sort();

    const handleSearch = (q: string) => {
        router.get('/glossary', { q: q || undefined, category: filters.category || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryFilter = (category: string | null) => {
        router.get('/glossary', { q: filters.q || undefined, category: category || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Glossaire" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Glossaire</h1>
                    <p className="text-muted-foreground text-sm">
                        Tous les termes techniques de l'architecture Digicel
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            placeholder="Rechercher un terme..."
                            defaultValue={filters.q || ''}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <Badge
                            variant={!filters.category ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleCategoryFilter(null)}
                        >
                            Tous
                        </Badge>
                        {categories.map((cat) => (
                            <Badge
                                key={cat}
                                variant={filters.category === cat ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handleCategoryFilter(cat)}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>
                </div>

                {terms.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                        Aucun terme trouvé
                    </p>
                ) : (
                    <div className="space-y-6">
                        {sortedLetters.map((letter) => (
                            <div key={letter}>
                                <h2 className="border-b pb-1 text-lg font-bold">{letter}</h2>
                                <div className="mt-2 space-y-3">
                                    {grouped[letter].map((term) => (
                                        <div key={term.id} className="group">
                                            <div className="flex items-baseline gap-2">
                                                {term.abbreviation && (
                                                    <span className="text-primary shrink-0 font-mono text-sm font-bold">
                                                        {term.abbreviation}
                                                    </span>
                                                )}
                                                <span className="text-sm font-semibold">{term.term}</span>
                                                {term.category && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {term.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground mt-0.5 text-sm">
                                                {term.definition}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
