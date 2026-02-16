import MuiAvatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <MuiAvatar
                src={user.avatar}
                alt={user.name}
                sx={{ width: 32, height: 32 }}
            >
                {getInitials(user.name)}
            </MuiAvatar>
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={500} noWrap>
                    {user.name}
                </Typography>
                {showEmail && (
                    <Typography variant="caption" color="text.secondary" noWrap component="p">
                        {user.email}
                    </Typography>
                )}
            </Box>
        </>
    );
}
