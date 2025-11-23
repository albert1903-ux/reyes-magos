import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { useChild } from '../context/ChildContext';

const ChildSelector = () => {
    const { selectedChildId, setSelectedChildId, childrenList, loading } = useChild();

    if (loading) return null;

    const handleAlignment = (event, newAlignment) => {
        if (newAlignment !== null) {
            setSelectedChildId(newAlignment);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ToggleButtonGroup
                value={selectedChildId}
                exclusive
                onChange={handleAlignment}
                aria-label="child selection"
                fullWidth
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                    borderRadius: 2,
                    '& .MuiToggleButtonGroup-grouped': {
                        border: 0,
                        '&.Mui-disabled': {
                            border: 0,
                        },
                        '&:not(:first-of-type)': {
                            borderRadius: 2,
                        },
                        '&:first-of-type': {
                            borderRadius: 2,
                        },
                    },
                }}
            >
                {childrenList.map((child) => (
                    <ToggleButton
                        key={child.id}
                        value={child.id}
                        sx={{
                            flex: 1,
                            m: 0.5,
                            borderRadius: 2,
                            border: 'none',
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: '#1a180d', // Dark text for contrast on gold
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                }
                            }
                        }}
                    >
                        {child.name}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
};

export default ChildSelector;
