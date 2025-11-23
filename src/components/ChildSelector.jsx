import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import { useChild } from '../context/ChildContext';

const ChildSelector = () => {
    const { selectedChildId, setSelectedChildId, childrenList, loading } = useChild();

    if (loading) return null;

    return (
        <Box sx={{ minWidth: 120, mb: 2 }}>
            <FormControl fullWidth size="small">
                <InputLabel id="child-select-label">Niño/a</InputLabel>
                <Select
                    labelId="child-select-label"
                    id="child-select"
                    value={selectedChildId || ''}
                    label="Niño/a"
                    onChange={(e) => setSelectedChildId(e.target.value)}
                >
                    {childrenList.map((child) => (
                        <MenuItem key={child.id} value={child.id}>
                            {child.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default ChildSelector;
