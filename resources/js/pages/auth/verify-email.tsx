import { Form, Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <Typography variant="body2" fontWeight={500} sx={{ color: 'success.main', textAlign: 'center', mb: 2 }}>
                    A new verification link has been sent to the email address
                    you provided during registration.
                </Typography>
            )}

            <Form {...send.form()}>
                {({ processing }) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <Button disabled={processing} variant="outlined">
                            {processing && <CircularProgress size={16} sx={{ mr: 1 }} />}
                            Resend verification email
                        </Button>

                        <TextLink href={logout()}>
                            Log out
                        </TextLink>
                    </Box>
                )}
            </Form>
        </AuthLayout>
    );
}
