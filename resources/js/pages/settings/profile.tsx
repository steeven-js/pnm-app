import { Form, Head, Link, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <TextField
                                        id="name"
                                        label="Name"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                        fullWidth
                                        error={!!errors.name}
                                    />
                                    <InputError message={errors.name} />
                                </Box>

                                <Box>
                                    <TextField
                                        id="email"
                                        label="Email address"
                                        type="email"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                        fullWidth
                                        error={!!errors.email}
                                    />
                                    <InputError message={errors.email} />
                                </Box>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the verification email.
                                                </Link>
                                            </Typography>

                                            {status === 'verification-link-sent' && (
                                                <Typography variant="body2" fontWeight={500} sx={{ mt: 1, color: 'success.main' }}>
                                                    A new verification link has been sent to your email address.
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
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

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
