import { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import StarIcon from '@mui/icons-material/Star';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

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
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
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
                <BottomNavigationAction label="Pedir" icon={<CardGiftcardIcon />} />
                <BottomNavigationAction label="Lista" icon={<StarIcon />} />
                <BottomNavigationAction label="Privado" icon={<AdminPanelSettingsIcon />} />
            </BottomNavigation>
        </Paper>
    );
};

export default Navbar;
