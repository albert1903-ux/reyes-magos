import { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, TextField, Card, CardContent } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const PinProtection = ({ children }) => {
    const [pin, setPin] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(false);

    // Check if already authenticated in this session
    useEffect(() => {
        const auth = sessionStorage.getItem('privado_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handlePinSubmit = (e) => {
        e.preventDefault();
        // Hardcoded PIN for now - can be moved to env or db later
        if (pin === '1903') {
            setIsAuthenticated(true);
            sessionStorage.setItem('privado_auth', 'true');
            setError(false);
        } else {
            setError(true);
            setPin('');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('privado_auth');
        setPin('');
    };

    if (isAuthenticated) {
        return (
            <>
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={handleLogout}
                        startIcon={<LockIcon />}
                    >
                        Bloquear
                    </Button>
                </Box>
                {children}
            </>
        );
    }

    return (
        <Container maxWidth="xs" sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card sx={{ width: '100%', borderRadius: 4, boxShadow: 3 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 3 }}>
                    <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: '50%', color: 'primary.contrastText' }}>
                        <LockIcon fontSize="large" />
                    </Box>

                    <Typography variant="h5" component="h1" align="center" fontWeight="bold">
                        Acceso Restringido
                    </Typography>

                    <Typography variant="body2" color="text.secondary" align="center">
                        Esta zona es solo para los ayudantes de los Reyes Magos.
                    </Typography>

                    <Box component="form" onSubmit={handlePinSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Introduce el PIN"
                            type="password"
                            variant="outlined"
                            value={pin}
                            onChange={(e) => {
                                if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                                    setPin(e.target.value);
                                    setError(false);
                                }
                            }}
                            error={error}
                            helperText={error ? "PIN incorrecto" : ""}
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                maxLength: 4,
                                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={pin.length !== 4}
                            sx={{ borderRadius: 2, py: 1.5 }}
                        >
                            Entrar
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default PinProtection;
