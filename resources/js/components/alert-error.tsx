import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

export default function AlertError({
    errors,
    title,
}: {
    errors: string[];
    title?: string;
}) {
    return (
        <MuiAlert severity="error" variant="outlined">
            <AlertTitle>{title || 'Something went wrong.'}</AlertTitle>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {Array.from(new Set(errors)).map((error, index) => (
                    <li key={index}>{error}</li>
                ))}
            </ul>
        </MuiAlert>
    );
}
