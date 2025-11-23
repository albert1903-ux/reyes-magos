import { useState, useRef } from 'react';
import { Box, Typography, Button, Card, CardMedia, CardContent, CircularProgress, Alert, Container } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { supabase } from '../lib/supabase';
import { useChild } from '../context/ChildContext';
import ChildSelector from '../components/ChildSelector';

const Pedir = () => {
    const { selectedChildId, childrenList } = useChild();
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const selectedChild = childrenList.find(c => c.id === selectedChildId);

    const handleFileSelect = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setSuccess(false);

            await uploadImage(file);
        } catch (error) {
            console.error('Error selecting file:', error);
        }
    };

    const uploadImage = async (file) => {
        if (!selectedChildId) {
            alert('Por favor selecciona un niño primero');
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${selectedChildId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('gift-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('gift-images')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('gifts')
                .insert([
                    {
                        child_id: selectedChildId,
                        image_url: publicUrl,
                        priority: 1, // Default priority
                    },
                ]);

            if (dbError) throw dbError;

            setSuccess(true);
            setImagePreview(null); // Clear preview after success
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

            {/* Top Header Image with Parallax */}
            <Box
                sx={{
                    width: '100%',
                    height: '50vh', // Increased height
                    minHeight: 300,
                    backgroundImage: 'url(/reyes-magos/assets/reyes_magos_top.png)',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    mb: 2
                }}
            />

            <Container maxWidth="md">
                {/* 1. Child Selector Block - Absolute Positioned */}
                <Box sx={{
                    position: 'absolute',
                    top: '60px',
                    left: 0,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 10,
                    px: 2
                }}>
                    <ChildSelector />
                </Box>

                <Box sx={{ mt: 4 }}> {/* Spacer for the absolute positioned element if needed, or just margin for next element */}

                    {/* 2. Festive Header (Card with text) */}
                    <Box
                        sx={{
                            position: 'relative',
                            height: 250,
                            width: '100%',
                            backgroundImage: 'url(/reyes-magos/assets/christmas_header_bg.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1a180d',
                            textAlign: 'center',
                            mb: 4,
                            borderRadius: 4,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                        }}
                    >


                        <Box sx={{ position: 'relative', px: 3, width: '100%', maxWidth: 600 }}>
                            <Typography variant="h4" component="h1" sx={{ mb: 1, color: '#1a180d', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                                ¡Hola, {selectedChild ? selectedChild.name : 'Pequeño'}!
                            </Typography>

                            <Typography variant="body1" sx={{ color: '#1a180d', fontWeight: 300, fontSize: '1.1rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                                Los Reyes Magos están esperando tu carta. ¿Qué te gustaría pedir este año?
                                <br />
                                <span style={{ fontWeight: 500, color: '#1a180d' }}>Sube una foto de tu juguete favorito.</span>
                            </Typography>
                        </Box>
                    </Box>

                    <Container maxWidth="sm">
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />

                        {uploading && (
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <CircularProgress />
                                <Typography variant="body2" sx={{ mt: 1 }}>Enviando a Oriente...</Typography>
                            </Box>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
                                ¡Regalo anotado! Muy pronto los Reyes Magos lo recibirán.
                            </Alert>
                        )}

                        {imagePreview && (
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="subtitle1" gutterBottom>Vista Previa:</Typography>
                                <CardMedia
                                    component="img"
                                    image={imagePreview}
                                    alt="Preview"
                                    sx={{ borderRadius: 2, maxHeight: 300, objectFit: 'contain' }}
                                />
                            </Box>
                        )}
                    </Container>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<CameraAltIcon />}
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading || !selectedChildId}
                            sx={{
                                py: 2,
                                px: 4,
                                fontSize: '1.2rem',
                                borderRadius: 50,
                                boxShadow: '0 8px 16px rgba(250, 198, 56, 0.3)',
                                width: '100%',
                                maxWidth: '300px',
                                color: '#1a180d', // Dark text for contrast
                                '&:hover': {
                                    backgroundColor: '#e8b530', // Slightly darker on hover
                                }
                            }}
                        >
                            {uploading ? 'Subiendo...' : 'Hacer Foto al Juguete'}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Pedir;
