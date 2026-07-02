import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  Grid,
  Avatar,
  IconButton
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import api from '../api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create User Modal State
  const [openModal, setOpenModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [code, setCode] = useState('');

  // Edit User Modal State
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editMasterKey, setEditMasterKey] = useState('');

  // Delete User Modal State
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [masterKey, setMasterKey] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = () => {
    setUsername('');
    setPassword('');
    setName('');
    setRole('user');
    setCode('');
    setFormError('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditName(userToEdit.name);
    setEditRole(userToEdit.role);
    setEditUsername(userToEdit.username);
    setEditPassword('');
    setEditMasterKey('');
    setFormError('');
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingUser(null);
  };

  const handleOpenDeleteModal = (userToDel) => {
    setUserToDelete(userToDel);
    setMasterKey('');
    setDeleteReason('');
    setFormError('');
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setUserToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !name || !role || !code) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/users', {
        username,
        password,
        name,
        role,
        code
      });
      
      setSnackbar({
        open: true,
        message: `Usuario "${name}" creado exitosamente.`,
        severity: 'success'
      });
      
      setOpenModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setFormError(err.response?.data?.error || 'Error al crear el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editRole || !editUsername) {
      setFormError('El nombre completo, usuario y rol son obligatorios.');
      return;
    }
    if (!editMasterKey) {
      setFormError('La clave maestra es obligatoria para autorizar los cambios.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.put(`/users/${editingUser.id}`, {
        name: editName,
        role: editRole,
        username: editUsername,
        password: editPassword || undefined
      }, {
        headers: {
          'x-master-key': editMasterKey
        }
      });
      
      setSnackbar({
        open: true,
        message: `Usuario "${editName}" actualizado exitosamente.`,
        severity: 'success'
      });
      
      setOpenEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error editing user:', err);
      setFormError(err.response?.data?.error || 'Error al editar el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!masterKey || !deleteReason.trim()) {
      setFormError('La clave maestra y el motivo de la eliminación son obligatorios.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const response = await api.delete(`/users/${userToDelete.id}`, {
        headers: {
          'x-master-key': masterKey,
          'x-delete-reason': deleteReason
        }
      });
      
      setSnackbar({
        open: true,
        message: response.data.message || `Usuario "${userToDelete.name}" eliminado.`,
        severity: 'success'
      });
      
      setOpenDeleteModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setFormError(err.response?.data?.error || 'Error al eliminar el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box className="tab-content">
      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(30, 58, 138, 0.05)', border: '1px solid #1e3a8a' }}>
            <PeopleIcon sx={{ color: '#1e3a8a' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Gestión de Usuarios
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Administra las credenciales de acceso, roles y códigos de propietarios
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenModal}
            sx={{ fontWeight: 'bold', py: 1.2 }}
          >
            Registrar Nuevo Usuario
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(153, 27, 27, 0.05)', border: '1px solid #991b1b', color: '#991b1b', borderRadius: 1 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre completo</TableCell>
                <TableCell>Usuario de acceso</TableCell>
                <TableCell align="center">Rol</TableCell>
                <TableCell align="center">Código Propietario</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(30, 58, 138, 0.05)', color: '#1e3a8a', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid rgba(30, 58, 138, 0.15)' }}>
                        {row.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <span style={{ color: '#0b0f19' }}>{row.name}</span>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#0b0f19' }}>{row.username}</TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={row.role === 'admin' ? <AdminIcon sx={{ fontSize: 16, color: '#ffffff !important' }} /> : <UserIcon sx={{ fontSize: 16, color: '#0b0f19 !important' }} />}
                      label={row.role === 'admin' ? 'ADMIN' : 'USER'}
                      size="small"
                      sx={{ 
                        fontWeight: 'bold',
                        px: 1,
                        backgroundColor: row.role === 'admin' ? '#1e3a8a' : '#f1efe9',
                        color: row.role === 'admin' ? '#ffffff' : '#0b0f19',
                        border: row.role === 'admin' ? '1px solid #172554' : '1px solid rgba(11, 15, 25, 0.15)',
                        borderRadius: 1
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.code}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 'bold', 
                        letterSpacing: '0.5px',
                        color: '#1e3a8a',
                        borderColor: 'rgba(30, 58, 138, 0.3)',
                        borderRadius: 1
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => handleOpenEditModal(row)}
                      size="small"
                      sx={{
                        border: '1px solid rgba(30, 58, 138, 0.15)',
                        color: '#1e3a8a',
                        borderRadius: 1,
                        p: 0.8,
                        '&:hover': {
                          backgroundColor: 'rgba(30, 58, 138, 0.05)'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenDeleteModal(row)}
                      size="small"
                      disabled={row.username === 'admin'}
                      sx={{
                        border: '1px solid rgba(153, 27, 27, 0.15)',
                        color: '#991b1b',
                        borderRadius: 1,
                        p: 0.8,
                        ml: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(153, 27, 27, 0.05)'
                        },
                        '&.Mui-disabled': {
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                          color: 'rgba(0, 0, 0, 0.25)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Creation Modal */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 500,
            background: '#ffffff',
            border: '1px solid rgba(11, 15, 25, 0.12)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Registrar Usuario
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(153, 27, 27, 0.05)', border: '1px solid #991b1b', color: '#991b1b', borderRadius: 1 }}>
                {formError}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              label="Nombre Completo"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  label="Nombre de Usuario"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: jperez"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  label="Código Propietario"
                  fullWidth
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej: P002"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            <TextField
              margin="normal"
              label="Contraseña"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="role-select-label">Rol del Sistema</InputLabel>
              <Select
                labelId="role-select-label"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Rol del Sistema"
              >
                <MenuItem value="user">Usuario (Solo Registro de Gastos)</MenuItem>
                <MenuItem value="admin">Administrador (Control Total)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseModal} variant="outlined" color="inherit">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={submitting}
              sx={{ minWidth: 100 }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Editing Modal */}
      <Dialog 
        open={openEditModal} 
        onClose={handleCloseEditModal}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 500,
            background: '#ffffff',
            border: '1px solid rgba(11, 15, 25, 0.12)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Editar Usuario (Requiere Clave Maestra)
        </DialogTitle>
        {editingUser && (
          <form onSubmit={handleEditSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(153, 27, 27, 0.05)', border: '1px solid #991b1b', color: '#991b1b', borderRadius: 1 }}>
                  {formError}
                </Alert>
              )}
              
              <TextField
                margin="normal"
                label="Nombre Completo"
                fullWidth
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    margin="normal"
                    label="Nombre de Usuario"
                    fullWidth
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    variant="outlined"
                    placeholder="Ej: jperez"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    margin="normal"
                    label="Código Propietario"
                    fullWidth
                    value={editingUser.code}
                    variant="outlined"
                    disabled
                    sx={{ mb: 2, '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#475569' } }}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
                <InputLabel id="edit-role-select-label">Rol del Sistema</InputLabel>
                <Select
                  labelId="edit-role-select-label"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  label="Rol del Sistema"
                  disabled={editingUser.username === 'admin'} // Only demotion is prevented
                >
                  <MenuItem value="user">Usuario (Solo Registro de Gastos)</MenuItem>
                  <MenuItem value="admin">Administrador (Control Total)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                label="Nueva Contraseña (Dejar vacío para conservar la actual)"
                type="password"
                fullWidth
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="••••••••"
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                label="Clave Maestra"
                type="password"
                fullWidth
                value={editMasterKey}
                onChange={(e) => setEditMasterKey(e.target.value)}
                placeholder="Ingrese clave maestra para autorizar cambios"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={handleCloseEditModal} variant="outlined" color="inherit">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={submitting}
                sx={{ minWidth: 100 }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Delete User Modal */}
      <Dialog 
        open={openDeleteModal} 
        onClose={handleCloseDeleteModal}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 450,
            background: '#ffffff',
            border: '1px solid rgba(11, 15, 25, 0.12)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: '#991b1b' }}>
          Confirmar Eliminación
        </DialogTitle>
        {userToDelete && (
          <form onSubmit={handleDeleteSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(153, 27, 27, 0.05)', border: '1px solid #991b1b', color: '#991b1b', borderRadius: 1 }}>
                  {formError}
                </Alert>
              )}
              <Typography variant="body2" sx={{ mb: 3, color: '#0b0f19' }}>
                ¿Está seguro de que desea eliminar al usuario <strong>{userToDelete.name} ({userToDelete.username})</strong> y todos sus gastos asociados en cascada? Esta acción es definitiva y requiere autorización.
              </Typography>
              
              <TextField
                margin="normal"
                label="Motivo de la Eliminación"
                fullWidth
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Ej: Empleado retirado de la empresa"
                variant="outlined"
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                label="Clave Maestra"
                type="password"
                fullWidth
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="Ingrese clave maestra para autorizar"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={handleCloseDeleteModal} variant="outlined" color="inherit">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="error"
                disabled={submitting}
                sx={{ minWidth: 100, backgroundColor: '#991b1b', '&:hover': { backgroundColor: '#7f1d1d' } }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Snackbar notification */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 1 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Users;
