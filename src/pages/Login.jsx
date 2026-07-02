import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton, 
  Alert, 
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useAuth } from '../App';

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor complete todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(username, password);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#faf9f5',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #faf9f5 0%, #f3efe6 100%)',
        p: 2
      }}
    >
      <Paper 
        sx={{ 
          p: { xs: 4, sm: 5 }, 
          width: '100%', 
          maxWidth: 440, 
          textAlign: 'center',
          border: '1px solid rgba(11, 15, 25, 0.12)',
          boxShadow: '0 8px 30px rgba(11, 15, 25, 0.04)',
          backgroundColor: '#ffffff',
          borderRadius: 2
        }}
      >
        <Avatar 
          sx={{ 
            mx: 'auto', 
            mb: 2, 
            width: 52, 
            height: 52, 
            bgcolor: 'rgba(30, 58, 138, 0.05)', 
            border: '1px solid #1e3a8a',
          }}
        >
          <WalletIcon sx={{ color: '#1e3a8a', fontSize: 28 }} />
        </Avatar>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#0b0f19', letterSpacing: '-0.5px' }}>
          BILLETERA<span style={{ color: '#1e3a8a' }}> PRO</span>
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500, letterSpacing: '0.2px' }}>
          SISTEMA DE ADMINISTRACIÓN Y GASTOS
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: 'rgba(153, 27, 27, 0.05)', 
              color: '#991b1b', 
              border: '1px solid rgba(153, 27, 27, 0.15)',
              textAlign: 'left',
              fontWeight: 500,
              borderRadius: 1
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="Ingrese usuario"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#475569' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="••••••••"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#475569' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: '#475569' }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 4 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ 
              py: 1.6,
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              backgroundColor: '#1e3a8a',
              '&:hover': {
                backgroundColor: '#172554'
              }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Iniciar Sesión'}
          </Button>
        </form>

        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(11, 15, 25, 0.08)' }}>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 500 }}>
            Acceso inicial con cuenta admin y clave 1234.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
