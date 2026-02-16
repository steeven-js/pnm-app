import FormHelperText from '@mui/material/FormHelperText';
import type { HTMLAttributes } from 'react';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <FormHelperText error sx={{ mx: 0 }} {...props}>
            {message}
        </FormHelperText>
    ) : null;
}
