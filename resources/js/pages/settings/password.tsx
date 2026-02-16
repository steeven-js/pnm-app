import { Form, Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <h1 className="sr-only">Password Settings</h1>

            <SettingsLayout>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Heading
                        variant="small"
                        title="Update password"
                        description="Ensure your account is using a long, random password to stay secure"
                    />

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <TextField
                                        id="current_password"
                                        label="Current password"
                                        inputRef={currentPasswordInput}
                                        name="current_password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Current password"
                                        fullWidth
                                        error={!!errors.current_password}
                                    />
                                    <InputError message={errors.current_password} />
                                </Box>

                                <Box>
                                    <TextField
                                        id="password"
                                        label="New password"
                                        inputRef={passwordInput}
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="New password"
                                        fullWidth
                                        error={!!errors.password}
                                    />
                                    <InputError message={errors.password} />
                                </Box>

                                <Box>
                                    <TextField
                                        id="password_confirmation"
                                        label="Confirm password"
                                        name="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                        fullWidth
                                        error={!!errors.password_confirmation}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        Save password
                                    </Button>

                                    <Fade in={recentlySuccessful}>
                                        <Typography variant="body2" color="text.secondary">
                                            Saved
                                        </Typography>
                                    </Fade>
                                </Box>
                            </Box>
                        )}
                    </Form>
                </Box>
            </SettingsLayout>
        </AppLayout>
    );
}
