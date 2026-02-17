import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

type EventNotesProps = { value: string; onChange: (value: string) => void; readOnly?: boolean };

export function EventNotes({ value, onChange, readOnly = false }: EventNotesProps) {
    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Notes</Typography>
            <TextField
                multiline minRows={2} maxRows={5} fullWidth size="small"
                placeholder="Notes libres sur cet événement..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                slotProps={{ input: { readOnly } }}
            />
        </Box>
    );
}
