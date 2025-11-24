import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#FAC638', // Updated Gold/Yellow
            contrastText: '#1a180d', // Dark text for contrast
        },
        secondary: {
            main: '#2E7D32', // Pine Green
        },
        warning: {
            main: '#FFD700', // Gold
        },
        background: {
            default: '#FAFAFA', // Snow White
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2rem',
            fontWeight: 700,
            color: '#D32F2F',
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#2E7D32',
        },
        h4: {
            fontWeight: 700,
            color: '#D32F2F',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20, // More rounded for a softer feel
                    textTransform: 'none',
                    fontWeight: 600,
                },
                containedPrimary: {
                    backgroundColor: '#FAC638', // Primary gold color
                    color: '#1a180d', // Dark text for contrast
                    '&:hover': {
                        backgroundColor: '#e8b530', // Slightly darker on hover
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #E0E0E0',
                },
            },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FAC638', // Primary color
                },
            },
        },
        MuiBottomNavigationAction: {
            styleOverrides: {
                root: {
                    color: 'rgba(26, 24, 13, 0.6)', // Dark text for contrast
                    '&.Mui-selected': {
                        color: '#1a180d', // Darker for selected
                    },
                },
            },
        },
    },
});

export default theme;
