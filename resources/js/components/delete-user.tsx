import { Form } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Heading
                variant="small"
                title="Delete account"
                description="Delete your account and all of its resources"
            />
            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'error.light',
                    bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.04)'),
                }}
            >
                <Typography fontWeight={500} color="error.main">
                    Warning
                </Typography>
                <Typography variant="body2" color="error.main" sx={{ opacity: 0.85 }}>
                    Please proceed with caution, this cannot be undone.
                </Typography>

                <Button
                    variant="contained"
                    color="error"
                    onClick={() => setOpen(true)}
                    sx={{ mt: 2 }}
                    data-test="delete-user-button"
                >
                    Delete account
                </Button>

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <Form
                        {...ProfileController.destroy.form()}
                        options={{ preserveScroll: true }}
                        onError={() => passwordInput.current?.focus()}
                        resetOnSuccess
                    >
                        {({ resetAndClearErrors, processing, errors }) => (
                            <>
                                <DialogTitle>
                                    Are you sure you want to delete your account?
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText sx={{ mb: 2 }}>
                                        Once your account is deleted, all of its resources
                                        and data will also be permanently deleted. Please
                                        enter your password to confirm you would like to
                                        permanently delete your account.
                                    </DialogContentText>

                                    <TextField
                                        id="password"
                                        type="password"
                                        name="password"
                                        inputRef={passwordInput}
                                        placeholder="Password"
                                        autoComplete="current-password"
                                        fullWidth
                                        size="small"
                                    />
                                    <InputError message={errors.password} />
                                </DialogContent>
                                <DialogActions sx={{ px: 3, pb: 2 }}>
                                    <Button
                                        onClick={() => {
                                            resetAndClearErrors();
                                            setOpen(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="error"
                                        disabled={processing}
                                        data-test="confirm-delete-user-button"
                                    >
                                        Delete account
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                    </Form>
                </Dialog>
            </Box>
        </Box>
    );
}
