import { Link } from '@inertiajs/react';
import MuiLink from '@mui/material/Link';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Link>;

export default function TextLink({
    children,
    ...props
}: Props) {
    return (
        <MuiLink
            component={Link}
            underline="always"
            color="text.primary"
            sx={{
                textUnderlineOffset: 4,
                textDecorationColor: 'divider',
                transition: 'text-decoration-color 0.3s ease-out',
                '&:hover': { textDecorationColor: 'currentcolor' },
            }}
            {...props}
        >
            {children}
        </MuiLink>
    );
}
