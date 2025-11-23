import { useState, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Card, CardMedia } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import { supabase } from '../lib/supabase';
import { useChild } from '../context/ChildContext';
import ChildSelector from '../components/ChildSelector';

const Pedir = () => {
    const { selectedChildId } = useChild();
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedChildId) {
            setMessage({ type: 'error', text: 'Por favor, selecciona un niño/a primero.' });
            return;
        }
        if (!imageFile) {
            setMessage({ type: 'error', text: 'Por favor, haz una foto o selecciona una imagen.' });
            return;
        }

        setUploading(true);
        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${selectedChildId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('gift-images')
                .upload(filePath, imageFile);

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
                    },
                ]);

            if (dbError) throw dbError;

            setMessage({ type: 'success', text: '¡Petición enviada a los Reyes Magos!' });
            setImageFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Error uploading:', error);
            setMessage({ type: 'error', text: 'Error al enviar la petición. Inténtalo de nuevo.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Pedir Regalo
            </Typography>

            <ChildSelector />

            <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelect}
            />

            <Button
                variant="contained"
                startIcon={<PhotoCameraIcon />}
                onClick={() => fileInputRef.current.click()}
                sx={{ mb: 3 }}
                size="large"
            >
                Hacer Foto
            </Button>

            {previewUrl && (
                <Card sx={{ maxWidth: 345, mb: 3, width: '100%' }}>
                    <CardMedia
                        component="img"
                        height="300"
                        image={previewUrl}
                        alt="Preview"
                    />
                </Card>
            )}

            {message && (
                <Alert severity={message.type} sx={{ mb: 2, width: '100%' }}>
                    {message.text}
                </Alert>
            )}

            <Button
                variant="contained"
                color="success"
                endIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleUpload}
                disabled={uploading || !imageFile || !selectedChildId}
                size="large"
                fullWidth
            >
                {uploading ? 'Enviando...' : 'Enviar Carta'}
            </Button>
        </Box>
    );
};

export default Pedir;
