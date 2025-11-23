import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, Grid, TextField, Checkbox, FormControlLabel, CircularProgress, Button, Divider, List, ListItem, ListItemText, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { supabase } from '../lib/supabase';
import { priceService } from '../services/priceService';

const Privado = () => {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState({}); // Map of giftId -> boolean
    const [comparisonResults, setComparisonResults] = useState({}); // Map of giftId -> result object

    useEffect(() => {
        fetchGifts();
    }, []);

    const fetchGifts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('gifts')
                .select(`
          *,
          children (name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGifts(data);
        } catch (error) {
            console.error('Error fetching gifts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (giftId, field, value) => {
        try {
            const { error } = await supabase
                .from('gifts')
                .update({ [field]: value })
                .eq('id', giftId);

            if (error) throw error;

            // Optimistic update
            setGifts(gifts.map(g => g.id === giftId ? { ...g, [field]: value } : g));
        } catch (error) {
            console.error('Error updating gift:', error);
            fetchGifts(); // Revert on error
        }
    };

    const handleSearchPrice = async (giftId, imageUrl) => {
        setAnalyzing(prev => ({ ...prev, [giftId]: true }));
        try {
            const result = await priceService.analyzeAndSearch(imageUrl);
            setComparisonResults(prev => ({ ...prev, [giftId]: result }));
        } catch (error) {
            console.error('Error searching price:', error);
        } finally {
            setAnalyzing(prev => ({ ...prev, [giftId]: false }));
        }
    };

    const applyPrice = (giftId, price, store) => {
        handleUpdate(giftId, 'price', price);
        handleUpdate(giftId, 'assigned_to', store);
    };

    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Zona Privada (Padres)
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {gifts.map((gift) => (
                        <Grid item xs={12} key={gift.id}>
                            <Card sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Grid container>
                                    <Grid item xs={4}>
                                        <CardMedia
                                            component="img"
                                            sx={{ height: '100%', objectFit: 'cover', minHeight: 200 }}
                                            image={gift.image_url}
                                            alt="Regalo"
                                        />
                                    </Grid>
                                    <Grid item xs={8}>
                                        <CardContent>
                                            <Typography component="div" variant="h6">
                                                {gift.children?.name}
                                            </Typography>
                                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <TextField
                                                    label="Precio"
                                                    type="number"
                                                    size="small"
                                                    value={gift.price || ''}
                                                    onChange={(e) => handleUpdate(gift.id, 'price', e.target.value)}
                                                    InputProps={{
                                                        startAdornment: <Typography sx={{ mr: 1 }}>€</Typography>,
                                                    }}
                                                />
                                                <TextField
                                                    label="Asignado a"
                                                    size="small"
                                                    value={gift.assigned_to || ''}
                                                    onChange={(e) => handleUpdate(gift.id, 'assigned_to', e.target.value)}
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={gift.is_bought || false}
                                                            onChange={(e) => handleUpdate(gift.id, 'is_bought', e.target.checked)}
                                                        />
                                                    }
                                                    label="Comprado"
                                                />

                                                <Divider sx={{ my: 1 }} />

                                                <Button
                                                    variant="outlined"
                                                    startIcon={analyzing[gift.id] ? <CircularProgress size={20} /> : <SearchIcon />}
                                                    onClick={() => handleSearchPrice(gift.id, gift.image_url)}
                                                    disabled={analyzing[gift.id]}
                                                >
                                                    {analyzing[gift.id] ? 'Analizando...' : 'Buscar Mejor Precio'}
                                                </Button>

                                                {comparisonResults[gift.id] && (
                                                    <Box sx={{ mt: 1, bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            {comparisonResults[gift.id].productName}
                                                        </Typography>
                                                        <List dense>
                                                            {comparisonResults[gift.id].prices.map((item, index) => (
                                                                <ListItem
                                                                    key={index}
                                                                    secondaryAction={
                                                                        <Button
                                                                            size="small"
                                                                            onClick={() => applyPrice(gift.id, item.price, item.store)}
                                                                        >
                                                                            Aplicar
                                                                        </Button>
                                                                    }
                                                                >
                                                                    <ListItemText
                                                                        primary={`${item.price}€ - ${item.store}`}
                                                                        secondary={index === 0 ? <Chip label="Mejor Precio" color="success" size="small" /> : null}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Box>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>
                    ))}
                    {gifts.length === 0 && (
                        <Typography variant="body1" sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
                            No hay regalos registrados.
                        </Typography>
                    )}
                </Grid>
            )}
        </Box>
    );
};

export default Privado;
