import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, Grid, CircularProgress, Container, Chip, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../lib/supabase';
import { useChild } from '../context/ChildContext';
import ChildSelector from '../components/ChildSelector';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Gift Card Component
const SortableGiftCard = ({ gift, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: gift.id });

    return (
        <Box ref={setNodeRef} sx={{ position: 'relative' }}>
            <Card
                sx={{
                    position: 'relative',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    opacity: isDragging ? 0.5 : 1,
                    transform: CSS.Transform.toString(transform),
                    transition: 'opacity 0.2s',
                    '&:hover .drag-handle': {
                        opacity: 1,
                    }
                }}
                {...attributes}
                {...listeners}
            >
                <CardMedia
                    component="img"
                    height="140"
                    image={gift.image_url}
                    alt="Regalo"
                />
                <Box
                    className="drag-handle"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 1,
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.7,
                        transition: 'opacity 0.2s',
                    }}
                >
                    <DragIndicatorIcon fontSize="small" sx={{ color: 'primary.main' }} />
                </Box>

                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        onDelete(gift.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on touch/click
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 1)',
                            color: 'error.main',
                        },
                        zIndex: 20, // Ensure it's above other elements
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Card>
        </Box>
    );
};

const Lista = () => {
    const { selectedChildId } = useChild();
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    const handleDelete = async (giftId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este regalo?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('gifts')
                .delete()
                .eq('id', giftId);

            if (error) throw error;

            // Update local state
            setGifts(gifts.filter(g => g.id !== giftId));
        } catch (error) {
            console.error('Error deleting gift:', error);
            alert('Error al eliminar el regalo');
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = gifts.findIndex((gift) => gift.id === active.id);
        const newIndex = gifts.findIndex((gift) => gift.id === over.id);

        // Reorder locally first for immediate feedback
        const newGifts = arrayMove(gifts, oldIndex, newIndex);
        setGifts(newGifts);

        // Update priorities in database
        try {
            // Assign new priorities based on position (higher index = higher priority)
            const updates = newGifts.map((gift, index) => ({
                id: gift.id,
                priority: newGifts.length - index, // Reverse so first item has highest priority
            }));

            // Update each gift's priority
            for (const update of updates) {
                const { error } = await supabase
                    .from('gifts')
                    .update({ priority: update.priority })
                    .eq('id', update.id);

                if (error) throw error;
            }
        } catch (error) {
            console.error('Error updating priorities:', error);
            // Revert on error
            fetchGifts();
        }
    };

    return (
        <Container maxWidth="md" sx={{ pt: 2 }}>
            <Box sx={{ pb: 4, width: '100%' }}>
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
                            Lista de Deseos de {selectedChildId ? '...' : '...'}
                        </Typography>

                        <ChildSelector />
                    </Box>
                </Card>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={gifts.map(g => g.id)}
                            strategy={rectSortingStrategy}
                        >
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                                {gifts.map((gift, index) => (
                                    <Box key={gift.id} sx={{ position: 'relative' }}>
                                        <Chip
                                            label={index + 1}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                zIndex: 10,
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                fontWeight: 'bold',
                                                boxShadow: 1,
                                                height: 24,
                                                minWidth: 24,
                                                '& .MuiChip-label': {
                                                    px: 1,
                                                }
                                            }}
                                        />
                                        <SortableGiftCard gift={gift} onDelete={handleDelete} />
                                    </Box>
                                ))}
                                {gifts.length === 0 && selectedChildId && (
                                    <Typography variant="body1" sx={{ mt: 2, gridColumn: '1 / -1', textAlign: 'center' }}>
                                        No hay regalos en la lista todavía.
                                    </Typography>
                                )}
                            </Box>
                        </SortableContext>
                    </DndContext>
                )}
            </Box>
        </Container>
    );
};

export default Lista;
