import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';

type EventChecklistProps = {
    items: string[];
    checkedItems: string[];
    onChange: (checkedItems: string[]) => void;
    readOnly?: boolean;
};

export function EventChecklist({ items, checkedItems, onChange, readOnly = false }: EventChecklistProps) {
    const handleToggle = (item: string) => {
        if (readOnly) return;
        const next = checkedItems.includes(item)
            ? checkedItems.filter((i) => i !== item)
            : [...checkedItems, item];
        onChange(next);
    };

    return (
        <FormGroup>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Checklist</Typography>
            {items.map((item) => (
                <FormControlLabel
                    key={item}
                    control={<Checkbox checked={checkedItems.includes(item)} onChange={() => handleToggle(item)} disabled={readOnly} size="small" />}
                    label={
                        <Typography variant="body2" sx={{
                            textDecoration: checkedItems.includes(item) ? 'line-through' : 'none',
                            color: checkedItems.includes(item) ? 'text.disabled' : 'text.primary',
                        }}>
                            {item}
                        </Typography>
                    }
                />
            ))}
        </FormGroup>
    );
}
