import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, Grid, IconButton, CircularProgress, Container } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { supabase } from '../lib/supabase';
import { useChild } from '../context/ChildContext';
import ChildSelector from '../components/ChildSelector';

const Lista = () => {
    const { selectedChildId } = useChild();
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedChildId) {
            fetchGifts();
        } else {
            setGifts([]);
        }
    }, [selectedChildId]);

    const fetchGifts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('gifts')
                .select('*')
                .eq('child_id', selectedChildId)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGifts(data);
        } catch (error) {
            console.error('Error fetching gifts:', error);
        } finally {
            setLoading(false);
        }
    };

    const updatePriority = async (giftId, currentPriority, change) => {
        const newPriority = (currentPriority || 0) + change;
        try {
            const { error } = await supabase
                .from('gifts')
                .update({ priority: newPriority })
                .eq('id', giftId);

            if (error) throw error;
            fetchGifts();
        } catch (error) {
            console.error('Error updating priority:', error);
        }
    };

    return (
        <Container maxWidth="md" sx={{ pt: 2 }}>
            <Box sx={{ pb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: '"Merriweather", serif', color: 'primary.main', textAlign: 'center', mb: 3 }}>
                    Lista de Deseos de {selectedChildId ? '...' : '...'}
                </Typography>

                <ChildSelector />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {gifts.map((gift) => (
                            <Grid item xs={6} sm={4} key={gift.id}>
                                <Card sx={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={gift.image_url}
                                        alt="Regalo"
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                                            borderTopLeftRadius: 8,
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() => updatePriority(gift.id, gift.priority, 1)}
                                        >
                                            <ArrowUpwardIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => updatePriority(gift.id, gift.priority, -1)}
                                        >
                                            <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                        {gifts.length === 0 && selectedChildId && (
                            <Typography variant="body1" sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
                                No hay regalos en la lista todavía.
                            </Typography>
                        )}
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default Lista;
