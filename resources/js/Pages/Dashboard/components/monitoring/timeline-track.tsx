import Box from '@mui/material/Box';
import type { EnrichedPnmEvent } from 'src/types/monitoring';
import { TimelineNode } from './timeline-node';

type TimelineTrackProps = {
    events: EnrichedPnmEvent[];
    selectedKey: string | null;
    onSelect: (key: string) => void;
};

export function TimelineTrack({ events, selectedKey, onSelect }: TimelineTrackProps) {
    const treatedCount = events.filter((e) => e.isPast || e.status === 'verified' || e.status === 'skipped').length;
    const progressPercent = events.length > 0 ? (treatedCount / events.length) * 100 : 0;

    return (
        <Box sx={{ position: 'relative', px: 1 }}>
            {/* Background rail */}
            <Box sx={{ position: 'absolute', top: 20, left: 28, right: 28, height: 3, bgcolor: 'divider', borderRadius: 1.5, zIndex: 0 }} />
            {/* Progress rail */}
            <Box sx={{
                position: 'absolute', top: 20, left: 28,
                width: `calc(${Math.min(progressPercent, 100)}% - 56px)`,
                height: 3, bgcolor: 'success.main', borderRadius: 1.5, zIndex: 1,
                transition: 'width 0.5s ease',
            }} />
            {/* Nodes */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                {events.map((event) => (
                    <TimelineNode key={event.key} event={event} isSelected={selectedKey === event.key} onClick={() => onSelect(event.key)} />
                ))}
            </Box>
        </Box>
    );
}
