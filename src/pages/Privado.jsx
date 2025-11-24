import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, Grid, TextField, Checkbox, FormControlLabel, CircularProgress, Button, Divider, List, ListItem, ListItemText, Chip, Container, Link, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { supabase } from '../lib/supabase';
import { priceService } from '../services/priceService';
import { useChild } from '../context/ChildContext';
import ChildSelector from '../components/ChildSelector';
import PinProtection from '../components/PinProtection';

const Privado = () => {
    const { selectedChildId } = useChild();
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState({}); // Map of giftId -> boolean
    const [comparisonResults, setComparisonResults] = useState({}); // Map of giftId -> result object

    useEffect(() => {
        fetchGifts();
    }, [selectedChildId]);

    const fetchGifts = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('gifts')
                .select(`
          *,
          children (name)
        `)
                .order('created_at', { ascending: false });

            if (selectedChildId) {
                query = query.eq('child_id', selectedChildId);
            }

            const { data, error } = await query;

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
            console.log('🔍 Search Result for gift', giftId, ':', result);
            console.log('📊 Prices array:', result.prices);
            console.log('📦 First price object:', result.prices?.[0]);
            setComparisonResults(prev => ({ ...prev, [giftId]: result }));
        } catch (error) {
            console.error('Error searching price:', error);
        } finally {
            setAnalyzing(prev => ({ ...prev, [giftId]: false }));
        }
    };



    return (
        <PinProtection>
            <Container maxWidth="md" sx={{ pt: 2 }}>
                <Box sx={{ pb: 4 }}>
                    <Card
                        sx={{
                            mb: 4,
                            borderRadius: 3,
                            overflow: 'hidden',
                            position: 'relative',
                            backgroundImage: 'url(/assets/christmas_header_bg.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                zIndex: 1,
                            }
                        }}
                    >
                        <Box
                            sx={{
                                position: 'relative',
                                zIndex: 2,
                                p: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3
                            }}
                        >
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    color: '#1a180d',
                                    textAlign: 'center',
                                    fontWeight: 700
                                }}
                            >
                                Panel de Padres (Privado)
                            </Typography>

                            <ChildSelector />
                        </Box>
                    </Card>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {gifts.map((gift) => (
                                <Grid item xs={12} key={gift.id}>
                                    <Card sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                        {/* PARTE SUPERIOR: CARD PRINCIPAL */}
                                        <Box sx={{ display: "flex", width: "100%" }}>

                                            {/* IMAGEN IZQUIERDA + CHECK */}
                                            <Box sx={{ position: "relative", width: "30%" }}>
                                                <Checkbox
                                                    checked={gift.is_bought || false}
                                                    onChange={(e) => handleUpdate(gift.id, 'is_bought', e.target.checked)}
                                                    size="small"
                                                    sx={{ position: "absolute", top: 8, left: 8, zIndex: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}
                                                />
                                                <CardMedia
                                                    component="img"
                                                    image={gift.image_url}
                                                    alt="Regalo"
                                                    sx={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 200 }}
                                                />
                                            </Box>

                                            {/* CONTENIDO DERECHO */}
                                            <CardContent sx={{ width: "70%" }}>
                                                <Typography variant="h6" gutterBottom>{gift.children?.name}</Typography>

                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Precio"
                                                            size="small"
                                                            type="number"
                                                            value={gift.price || ''}
                                                            onChange={(e) => handleUpdate(gift.id, 'price', e.target.value)}
                                                            InputProps={{ startAdornment: <Typography>€&nbsp;</Typography> }}
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Asignado a"
                                                            size="small"
                                                            value={gift.assigned_to || ''}
                                                            onChange={(e) => handleUpdate(gift.id, 'assigned_to', e.target.value)}
                                                            fullWidth
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    startIcon={analyzing[gift.id] ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                                    onClick={() => handleSearchPrice(gift.id, gift.image_url)}
                                                    disabled={analyzing[gift.id]}
                                                    sx={{ mt: 2 }}
                                                >
                                                    {analyzing[gift.id] ? 'Analizando...' : 'Buscar mejor precio'}
                                                </Button>
                                            </CardContent>
                                        </Box>

                                        {/* RESULTADOS DE LA BÚSQUEDA - FULL WIDTH - COLLAPSIBLE */}
                                        {comparisonResults[gift.id] && (
                                            <Accordion defaultExpanded sx={{ width: '100%', boxShadow: 'none', '&:before': { display: 'none' } }}>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{ bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider', minHeight: 48 }}
                                                >
                                                    <Typography variant="subtitle2">
                                                        Resultados para: {comparisonResults[gift.id].productName}
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ px: 2, pb: 2, pt: 1, bgcolor: 'grey.50' }}>
                                                    {comparisonResults[gift.id].message && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {comparisonResults[gift.id].message}
                                                        </Typography>
                                                    )}

                                                    <List dense disablePadding>
                                                        {comparisonResults[gift.id].prices
                                                            .filter(item => item.price > 0)
                                                            .map((item, index) => (
                                                                <ListItem
                                                                    key={index}
                                                                    disableGutters
                                                                    sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        py: 1,
                                                                        borderBottom: index < comparisonResults[gift.id].prices.filter(i => i.price > 0).length - 1 ? '1px solid' : 'none',
                                                                        borderColor: 'divider'
                                                                    }}
                                                                >
                                                                    <Box sx={{ flex: 1, mr: 2 }}>
                                                                        <Link
                                                                            href={item.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            color="primary"
                                                                            underline="hover"
                                                                        >
                                                                            <Typography variant="body2" component="div">
                                                                                <strong>{item.store}</strong>
                                                                            </Typography>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                {item.title || 'Producto sin nombre'}
                                                                            </Typography>
                                                                        </Link>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                                                                        {item.referencePrice && (
                                                                            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                                                                {item.referencePrice}€
                                                                            </Typography>
                                                                        )}
                                                                        <Chip
                                                                            label={`${item.price}€`}
                                                                            variant={index === 0 ? "filled" : "outlined"}
                                                                            color={index === 0 ? "success" : "default"}
                                                                        />
                                                                    </Box>
                                                                </ListItem>
                                                            ))}
                                                    </List>
                                                </AccordionDetails>
                                            </Accordion>
                                        )}
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
            </Container>
        </PinProtection>
    );
};

export default Privado;
