import { useState, useCallback } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Iconify } from 'src/components/iconify';

// ─── Event label mapping ─────────────────────────────────────────────────

const EVENT_LABELS: Record<string, { label: string; time: string }> = {
    verif_bascule_server: { label: 'Bascule & Valorisation (serveur)', time: '09:00' },
    rio_reporting: { label: 'Reporting RIO incorrect', time: '09:00' },
    incidents: { label: 'Incidents PNM détectés', time: '09:01' },
    verif_bascule_email: { label: 'Contrôle bascule & fichiers EMA', time: '09:30' },
    verif_generation_pnmdata: { label: 'Génération fichiers vacation', time: '10:15' },
    pso_jour: { label: 'PSO — Vérification résiliations', time: '10:16' },
    verif_acquittements: { label: 'Acquittements & portages', time: '11:15' },
    tickets_attente: { label: 'Tickets en attente', time: '11:30' },
    vacation_1: { label: '1ère vacation', time: '11:35' },
    porta_prevues: { label: 'Portabilités prévues DIGICEL-WIZZEE', time: '15:25' },
    vacation_2: { label: '2ème vacation', time: '15:35' },
    vacation_3: { label: '3ème vacation + clôture', time: '20:35' },
};

const STATUS_ICONS: Record<string, string> = {
    verified: '✅',
    issue: '⚠️',
    skipped: '⏭️',
    pending: '⏳',
};

// ─── Report text generator ──────────────────────────────────────────────

function generateReportText(data: any): string {
    const L: string[] = [];
    const sep = '═'.repeat(60);
    const sep2 = '─'.repeat(60);

    L.push(sep);
    L.push(`RAPPORT JOURNALIER PNM — ${data.date_formatted}`);
    L.push(`${data.user} — Chargé d'applications`);
    L.push(sep);
    L.push('');

    // Summary
    L.push('RÉSUMÉ');
    L.push(sep2);
    const s = data.summary;
    L.push(`  Événements traités : ${s.verified + s.issues + s.skipped}/${s.total_events} (${s.completion_pct}%)`);
    L.push(`  ✅ Vérifiés : ${s.verified}  |  ⚠️ Problèmes : ${s.issues}  |  ⏭️ Ignorés : ${s.skipped}  |  ⏳ En attente : ${s.pending}`);
    L.push('');

    if (data.is_holiday) {
        L.push('  📅 JOUR FÉRIÉ — Pas de traitement PNM');
        L.push('');
    }

    // Timeline detail
    L.push('TIMELINE DÉTAILLÉE');
    L.push(sep2);

    // Sort timeline by scheduled time
    const sorted = [...data.timeline].sort((a: any, b: any) => {
        const ta = EVENT_LABELS[a.event_type]?.time || '99:99';
        const tb = EVENT_LABELS[b.event_type]?.time || '99:99';
        return ta.localeCompare(tb);
    });

    for (const event of sorted) {
        const config = EVENT_LABELS[event.event_type] || { label: event.event_type, time: '??' };
        const icon = STATUS_ICONS[event.status] || '❓';
        const meta = event.metadata || {};

        L.push('');
        L.push(`  ${config.time} ${icon} ${config.label}`);

        // Add metadata details per event type
        switch (event.event_type) {
            case 'verif_bascule_server':
                if (meta.ema_operators_ok !== undefined) {
                    L.push(`         EmaExtracter : ${meta.ema_operators_ok}/${meta.ema_operators_total} opérateurs OK`);
                    if (meta.ema_count) L.push(`         Bascules ajoutées : ${meta.ema_count}`);
                }
                if (meta.emm_operators_ok !== undefined) {
                    L.push(`         EmmExtracter : ${meta.emm_operators_ok}/${meta.emm_operators_total} opérateurs OK`);
                    if (meta.emm_count) L.push(`         Enregistrements valorisés : ${meta.emm_count}`);
                }
                if (meta.all_ok) L.push('         Fin de traitement confirmée');
                break;

            case 'verif_bascule_email':
                if (meta.bascule_fin) L.push('         Bascule MOBI : FIN confirmée');
                if (meta.rl_ok !== undefined && meta.rl_total !== undefined) L.push(`         Rapport RL : ${meta.rl_ok}/${meta.rl_total} OK`);
                if (meta.fnr_present) L.push('         Fichier fnr_action_v3.bh : présent');
                if (meta.pourcentage_ok !== null && meta.pourcentage_ok !== undefined) {
                    L.push(`         Commandes OK : ${meta.pourcentage_ok}%`);
                }
                break;

            case 'rio_reporting':
                if (meta.total_refus !== undefined) {
                    L.push(`         Refus entrante : ${meta.refus_entrante ?? '?'}`);
                    L.push(`         Refus sortante : ${meta.refus_sortante ?? '?'}`);
                    if (meta.total_refus === 0) L.push('         Aucun refus RIO — RAS');
                }
                break;

            case 'incidents':
                if (meta.total_incidents !== undefined) {
                    L.push(`         Total incidents : ${meta.total_incidents}`);
                    if (meta.refusals > 0) L.push(`         Refus 1210/1220 : ${meta.refusals}`);
                    if (meta.ar_non_recu > 0) L.push(`         AR non-reçu : ${meta.ar_non_recu}`);
                    if (meta.file_errors > 0) L.push(`         Erreurs fichier : ${meta.file_errors}`);
                    if (meta.operators_involved?.length) L.push(`         Opérateurs : ${meta.operators_involved.join(', ')}`);
                }
                break;

            case 'verif_generation_pnmdata':
                if (meta.files) {
                    L.push(`         ${meta.operators_generated}/${meta.operators_total} opérateurs : fichiers PNMDATA générés`);
                    for (const code of ['01', '03', '04', '05', '06']) {
                        const f = (meta.files as Record<string, { file: string; tickets: number } | null>)[code];
                        if (f) {
                            L.push(`         Op. ${code}: ${f.file} (${f.tickets} tickets)`);
                        }
                    }
                    if (meta.total_tickets) L.push(`         Total tickets : ${meta.total_tickets}`);
                } else if (event.notes) {
                    for (const nl of event.notes.split('\n')) {
                        if (nl.trim()) L.push(`         ${nl.trim()}`);
                    }
                }
                break;

            case 'pso_jour':
                if (meta.has_resiliations) {
                    L.push(`         ⚠ ${meta.msisdn_count} MSISDN avec résiliation non effectuée`);
                    if (meta.msisdns?.length) L.push(`         MSISDN : ${(meta.msisdns as string[]).join(', ')}`);
                    L.push('         → Procédure : résiliation manuelle via SoapUI (Cas Pratique #18)');
                } else if (meta.has_resiliations === false) {
                    L.push('         Aucune résiliation en attente — RAS');
                }
                break;

            case 'verif_acquittements':
                if (meta.operator_checks) {
                    L.push(`         ${meta.operators_ok}/${meta.operators_total} opérateurs : aucun AR SYNC non-reçu`);
                    const opNames: Record<string, string> = { '03': 'SFR Caraïbe', '04': 'Dauphin Télécom', '05': 'UTS', '06': 'FREEC' };
                    const checks = meta.operator_checks as Record<string, boolean>;
                    for (const code of ['03', '04', '05', '06']) {
                        const ok = checks[code];
                        L.push(`         Op. ${code} (${opNames[code]}): ${ok ? 'Check success' : '⚠ Non détecté'}`);
                    }
                    if (meta.acr_count) L.push(`         ACR traités : ${meta.acr_count}`);
                    if ((meta.not_found_count as number) > 0) L.push(`         ⚠ ${meta.not_found_count} fichier(s) NOT FOUND`);
                } else if (event.notes) {
                    for (const nl of event.notes.split('\n')) {
                        if (nl.trim()) L.push(`         ${nl.trim()}`);
                    }
                }
                break;

            case 'tickets_attente':
                if (meta.tickets_1210 !== undefined) L.push(`         Tickets 1210 : ${meta.tickets_1210} en attente`);
                if (meta.tickets_generaux !== undefined) L.push(`         Tickets généraux : ${meta.tickets_generaux} en attente`);
                break;

            case 'vacation_1':
            case 'vacation_2':
            case 'vacation_3':
                if (meta.files_exchanged !== undefined) {
                    L.push(`         ${meta.files_exchanged}/${meta.files_expected} fichiers échangés`);
                    if (meta.has_err) L.push('         ⚠ Fichier(s) .ERR détecté(s)');
                    else L.push('         Aucun .ERR');
                }
                break;

            case 'porta_prevues':
                if (meta.digicel_in !== undefined) {
                    L.push(`         DIGICEL IN: ${meta.digicel_in} / OUT: ${meta.digicel_out}`);
                    L.push(`         WIZZEE  IN: ${meta.wizzee_in} / OUT: ${meta.wizzee_out}`);
                    L.push(`         Total   IN: ${meta.total_in} / OUT: ${meta.total_out}`);
                    if (meta.internes !== null && meta.internes !== undefined) L.push(`         Internes veille : ${meta.internes}`);
                }
                break;

            default:
                break;
        }

        // Show notes if no metadata
        if (!meta || Object.keys(meta).length === 0) {
            if (event.notes) {
                for (const nl of event.notes.split('\n')) {
                    if (nl.trim()) L.push(`         ${nl.trim()}`);
                }
            }
        }
    }

    L.push('');

    // Warnings
    if (data.warnings?.length > 0) {
        L.push('POINTS D\'ATTENTION');
        L.push(sep2);
        for (const w of data.warnings) {
            const config = EVENT_LABELS[w.event_type] || { label: w.event_type };
            L.push(`  ⚠️ [${config.label}] ${w.details}`);
        }
        L.push('');
    }

    // Comparisons
    if (data.comparisons?.length > 0) {
        L.push('COMPARATIFS');
        L.push(sep2);
        for (const c of data.comparisons) {
            if (c.type === 'pso_vs_previsions') {
                const status = c.ok ? '✅' : '⚠️';
                L.push(`  ${status} ${c.label} : ${c.actual} réel vs ${c.expected} prévu (écart ${c.ecart_pct}%)`);
                if (c.detail) {
                    L.push(`         GPMAG: ${c.detail.pso_gpmag} réel / ${c.detail.prev_digicel_out} prévu`);
                    L.push(`         WIZZEE: ${c.detail.pso_wizzee} réel / ${c.detail.prev_wizzee_out} prévu`);
                }
            }
            if (c.type === 'vacation_1_vs_2') {
                L.push(`  Vac1: ${c.vac1_files} échangés ${c.vac1_err ? '⚠ ERR' : '✅'}`);
                L.push(`  Vac2: ${c.vac2_files} échangés ${c.vac2_err ? '⚠ ERR' : '✅'}`);
            }
        }
        L.push('');
    }

    L.push(sep);
    L.push(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
    L.push('PNM App — Rapport journalier');
    L.push(sep);

    return L.join('\n');
}

// ─── Component ──────────────────────────────────────────────────────────

function getCsrfToken(): string {
    return document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1]?.replace(/%3D/g, '=') ?? '';
}

type DailyReportButtonProps = {
    date: string; // YYYY-MM-DD
};

export function DailyReportButton({ date }: DailyReportButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/monitoring/report?date=${date}`, {
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch report');

            const data = await response.json();
            const reportText = generateReportText(data);

            // Download as .txt
            const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Rapport_PNM_${date}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Report generation failed:', err);
        } finally {
            setLoading(false);
        }
    }, [date]);

    return (
        <Button
            variant="outlined"
            color="info"
            size="small"
            onClick={handleGenerate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Iconify icon="solar:document-text-bold-duotone" width={18} />}
        >
            Rapport du jour
        </Button>
    );
}
