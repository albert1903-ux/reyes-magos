import { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(0);

    useEffect(() => {
        switch (location.pathname) {
            case '/pedir':
                setValue(0);
                break;
            case '/lista':
                setValue(1);
                break;
            case '/privado':
                setValue(2);
                break;
            default:
                setValue(-1); // No selection for home or other pages
        }
    }, [location.pathname]);

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                    switch (newValue) {
                        case 0:
                            navigate('/pedir');
                            break;
                        case 1:
                            navigate('/lista');
                            break;
                        case 2:
                            navigate('/privado');
                            break;
                    }
                }}
            >
                <BottomNavigationAction label="Pedir" icon={<EditIcon />} />
                <BottomNavigationAction label="Lista" icon={<ListIcon />} />
                <BottomNavigationAction label="Privado" icon={<PersonIcon />} />
            </BottomNavigation>
        </Paper>
    );
};

export default Navbar;
