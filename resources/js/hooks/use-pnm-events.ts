import { useMemo } from 'react';

import type { MonitoringEvent, EnrichedPnmEvent } from 'src/types/monitoring';
import { pnmEventsConfig } from 'src/config/pnm-events-config';

function parseTimeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

export function usePnmEvents(dbEvents: MonitoringEvent[], nowHHmm: string) {
    return useMemo(() => {
        const eventMap = new Map<string, MonitoringEvent>();
        for (const ev of dbEvents) {
            eventMap.set(ev.event_type, ev);
        }

        const nowMinutes = parseTimeToMinutes(nowHHmm);

        return pnmEventsConfig.map((config, index): EnrichedPnmEvent => {
            const dbEvent = eventMap.get(config.key) ?? null;
            const eventMinutes = parseTimeToMinutes(config.scheduledTime);
            const nextEvent = pnmEventsConfig[index + 1];
            const nextMinutes = nextEvent ? parseTimeToMinutes(nextEvent.scheduledTime) : 24 * 60;

            return {
                ...config,
                isPast: nowMinutes >= nextMinutes,
                isCurrent: nowMinutes >= eventMinutes && nowMinutes < nextMinutes,
                isFuture: nowMinutes < eventMinutes,
                status: dbEvent?.status ?? 'pending',
                dbEvent,
            };
        });
    }, [dbEvents, nowHHmm]);
}
