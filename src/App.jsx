import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  Chip, 
  Container,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  ReceiptLong as ExpensesIcon,
  People as UsersIcon,
  Logout as LogoutIcon,
  AccountBalanceWallet as WalletIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  History as HistoryIcon
} from '@mui/icons-material';

import Login from './pages/Login';
import Expenses from './pages/Expenses';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import api from './api';

// Create Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const drawerWidth = 280;

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('expenses'); // 'expenses' or 'users'
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token: jwtToken, user: userData } = response.data;
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
      setCurrentTab('expenses'); // Default view
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Error al iniciar sesión. Intente nuevamente.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 50%, #faf9f5 0%, #f3efe6 100%)'
        }}
      >
        <CircularProgress size={50} thickness={4} sx={{ color: '#1e3a8a' }} />
        <Typography sx={{ mt: 3, color: '#1e3a8a', letterSpacing: '1px', fontWeight: 'bold' }}>
          CARGANDO SISTEMA...
        </Typography>
      </Box>
    );
  }

  // If user is not logged in, render the Login screen
  if (!token || !user) {
    return (
      <AuthContext.Provider value={{ user, token, login, logout }}>
        <Login />
      </AuthContext.Provider>
    );
  }

  // Sidebar navigation and user profile content
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#faf9f5' }}>
      {/* Brand logo header */}
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.03) 0%, rgba(0,0,0,0) 100%)' 
        }}
      >
        <Avatar sx={{ bgcolor: 'rgba(30, 58, 138, 0.05)', border: '1px solid #1e3a8a' }}>
          <WalletIcon sx={{ color: '#1e3a8a' }} />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ color: '#0b0f19', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            BILLETERA
            <Box component="span" sx={{ color: '#1e3a8a' }}> PRO</Box>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
            CONTROL DE GASTOS
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(11, 15, 25, 0.08)' }} />

      {/* User profile card */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          sx={{ 
            width: 64, 
            height: 64, 
            mb: 1.5,
            border: '2px solid',
            borderColor: '#1e3a8a',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.08)',
            bgcolor: 'rgba(30, 58, 138, 0.05)',
            color: '#1e3a8a',
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" sx={{ color: '#0b0f19', fontWeight: 700, textAlign: 'center' }}>
          {user.name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#475569', mb: 1.5 }}>
          ID: {user.code}
        </Typography>
        <Chip 
          icon={user.role === 'admin' ? <AdminIcon style={{ color: '#ffffff' }} /> : <UserIcon style={{ color: '#0b0f19' }} />}
          label={user.role === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'} 
          size="small" 
          sx={{ 
            fontWeight: 700, 
            fontSize: '0.65rem',
            letterSpacing: '1.2px',
            backgroundColor: user.role === 'admin' ? '#1e3a8a' : '#f1efe9',
            color: user.role === 'admin' ? '#ffffff' : '#0b0f19',
            border: '1px solid rgba(11, 15, 25, 0.15)',
            borderRadius: 1,
            '& .MuiChip-icon': {
              color: 'inherit'
            }
          }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(11, 15, 25, 0.08)', mb: 2 }} />

      {/* Menu links list */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton 
            onClick={() => { setCurrentTab('expenses'); setMobileOpen(false); }}
            selected={currentTab === 'expenses'}
            sx={{
              borderRadius: '6px',
              backgroundColor: currentTab === 'expenses' ? 'rgba(30, 58, 138, 0.08)' : 'transparent',
              borderLeft: currentTab === 'expenses' ? '4px solid #1e3a8a' : '4px solid transparent',
              color: currentTab === 'expenses' ? '#1e3a8a' : '#475569',
              transition: 'all 0.15s',
              '&:hover': {
                backgroundColor: 'rgba(30, 58, 138, 0.04)',
                color: '#1e3a8a'
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'rgba(30, 58, 138, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <ExpensesIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Gastos" 
              primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.5px' }} 
            />
          </ListItemButton>
        </ListItem>

        {user.role === 'admin' && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => { setCurrentTab('users'); setMobileOpen(false); }}
              selected={currentTab === 'users'}
              sx={{
                borderRadius: '6px',
                backgroundColor: currentTab === 'users' ? 'rgba(30, 58, 138, 0.08)' : 'transparent',
                borderLeft: currentTab === 'users' ? '4px solid #1e3a8a' : '4px solid transparent',
                color: currentTab === 'users' ? '#1e3a8a' : '#475569',
                transition: 'all 0.15s',
                '&:hover': {
                  backgroundColor: 'rgba(30, 58, 138, 0.04)',
                  color: '#1e3a8a'
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(30, 58, 138, 0.08)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <UsersIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Usuarios" 
                primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.5px' }} 
              />
            </ListItemButton>
          </ListItem>
        )}

        {user.role === 'admin' && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => { setCurrentTab('logs'); setMobileOpen(false); }}
              selected={currentTab === 'logs'}
              sx={{
                borderRadius: '6px',
                backgroundColor: currentTab === 'logs' ? 'rgba(30, 58, 138, 0.08)' : 'transparent',
                borderLeft: currentTab === 'logs' ? '4px solid #1e3a8a' : '4px solid transparent',
                color: currentTab === 'logs' ? '#1e3a8a' : '#475569',
                transition: 'all 0.15s',
                '&:hover': {
                  backgroundColor: 'rgba(30, 58, 138, 0.04)',
                  color: '#1e3a8a'
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(30, 58, 138, 0.08)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Auditoría" 
                primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.5px' }} 
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider sx={{ borderColor: 'rgba(11, 15, 25, 0.08)' }} />

      {/* Logout button */}
      <Box sx={{ p: 2 }}>
        <ListItemButton 
          onClick={logout}
          sx={{
            borderRadius: '6px',
            color: '#991b1b',
            transition: 'all 0.15s',
            '&:hover': {
              backgroundColor: 'rgba(153, 27, 27, 0.06)',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#991b1b', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Cerrar Sesión" 
            primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600 }} 
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#faf9f5' }}>
        {/* Responsive Drawer navigation */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                backgroundColor: '#faf9f5',
                borderRight: '1px solid rgba(11, 15, 25, 0.08)'
              },
            }}
          >
            {drawerContent}
          </Drawer>

          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                backgroundColor: '#faf9f5',
                borderRight: '1px solid rgba(11, 15, 25, 0.08)',
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        {/* Dashboard Main layout container */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Top header bar */}
          <AppBar
            position="sticky"
            sx={{
              backgroundColor: '#faf9f5',
              borderBottom: '1px solid rgba(11, 15, 25, 0.08)',
              boxShadow: 'none',
              zIndex: 10,
              color: '#0b0f19'
            }}
          >
            <Container maxWidth="xl">
              <Toolbar disableGutters sx={{ minHeight: 70, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { md: 'none' } }}
                  >
                    <MenuIcon sx={{ color: '#0b0f19' }} />
                  </IconButton>
                  
                  <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                    {currentTab === 'expenses' ? 'REGISTRO DE GASTOS' : currentTab === 'users' ? 'CONTROL DE USUARIOS' : 'BITÁCORA DE AUDITORÍA'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#475569', display: { xs: 'none', sm: 'block' } }}>
                    Conectado como:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#1e3a8a', fontWeight: 'bold' }}>
                    {user.name} ({user.code})
                  </Typography>
                </Box>
              </Toolbar>
            </Container>
          </AppBar>

          {/* Main workspace view */}
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
            <Container maxWidth="xl" disableGutters sx={{ height: '100%' }}>
              {currentTab === 'expenses' ? <Expenses /> : currentTab === 'users' ? <Users /> : <AuditLogs />}
            </Container>
          </Box>
        </Box>
      </Box>
    </AuthContext.Provider>
  );
}

export default App;
