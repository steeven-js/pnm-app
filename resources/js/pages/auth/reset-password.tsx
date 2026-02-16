import { Form, Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            id="email"
                            label="Email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            slotProps={{ input: { readOnly: true } }}
                            error={!!errors.email}
                            helperText={errors.email}
                            fullWidth
                        />

                        <TextField
                            id="password"
                            label="Password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            autoFocus
                            placeholder="Password"
                            error={!!errors.password}
                            helperText={errors.password}
                            fullWidth
                        />

                        <TextField
                            id="password_confirmation"
                            label="Confirm password"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            placeholder="Confirm password"
                            error={!!errors.password_confirmation}
                            helperText={errors.password_confirmation}
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={processing}
                            data-test="reset-password-button"
                            sx={{ mt: 1 }}
                        >
                            {processing && <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />}
                            Reset password
                        </Button>
                    </Box>
                )}
            </Form>
        </AuthLayout>
    );
}
