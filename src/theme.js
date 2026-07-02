import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e3a8a', // Deep Executive Navy Blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#475569', // Steel/Slate Gray
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf9f5', // Alabaster Cream
      paper: '#ffffff', // Crisp White
    },
    text: {
      primary: '#0b0f19', // High-contrast charcoal/off-black (Letras más oscuras)
      secondary: '#475569', // Steel Gray
    },
    success: {
      main: '#065f46', // Deep Forest Green
    },
    warning: {
      main: '#92400e', // Deep Amber/Ochre
    },
    error: {
      main: '#991b1b', // Burgundy Red
    },
    divider: 'rgba(11, 15, 25, 0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '0.1px',
      color: '#0b0f19',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '0.1px',
      color: '#0b0f19',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.1px',
      color: '#0b0f19',
    },
    body1: {
      color: '#0b0f19',
    },
    body2: {
      color: '#475569',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Refined square-ish corporate borders instead of round bubbled ones
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#faf9f5',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #faf9f5 0%, #f3efe6 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          color: '#0b0f19',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(11, 15, 25, 0.08)',
          boxShadow: '0 4px 20px rgba(11, 15, 25, 0.03)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 20px',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          backgroundColor: '#1e3a8a',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#172554',
          },
        },
        containedSecondary: {
          backgroundColor: '#475569',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#334155',
            boxShadow: '0 4px 12px rgba(71, 85, 105, 0.15)',
          },
        },
        outlined: {
          borderColor: 'rgba(11, 15, 25, 0.15)',
          color: '#0b0f19',
          '&:hover': {
            borderColor: '#1e3a8a',
            backgroundColor: 'rgba(30, 58, 138, 0.04)',
            boxShadow: '0 0 6px rgba(30, 58, 138, 0.08)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          transition: 'all 0.2s ease',
          color: '#0b0f19',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(30, 58, 138, 0.4)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1e3a8a',
            boxShadow: '0 0 0 2px rgba(30, 58, 138, 0.08)',
          },
          '& .MuiInputAdornment-root .MuiSvgIcon-root': {
            color: 'rgba(11, 15, 25, 0.45)',
          },
        },
        notchedOutline: {
          borderColor: 'rgba(11, 15, 25, 0.12)',
          transition: 'border-color 0.2s ease',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& th': {
            backgroundColor: '#f1efe9', // Clean gray/cream contrast
            color: '#0b0f19',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            borderBottom: '1px solid rgba(11, 15, 25, 0.12)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(30, 58, 138, 0.02) !important',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(11, 15, 25, 0.06)',
          padding: '16px',
          color: '#0b0f19',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
