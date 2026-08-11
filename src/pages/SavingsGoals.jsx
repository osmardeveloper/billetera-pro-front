import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  Flag as FlagIcon,
  Add as AddIcon,
  History as HistoryIcon,
  MonetizationOn as CoinIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  CalendarToday as DateIcon,
  CheckCircle as SuccessIcon,
  TrendingUp as ProgressIcon
} from '@mui/icons-material';
import { useAuth } from '../App';
import api from '../api';

function SavingsGoals() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  // State
  const [goals, setGoals] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOwner, setFilterOwner] = useState('');

  // Modales
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCuotaModal, setOpenCuotaModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);

  // Formulario metas
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [tiempoCantidad, setTiempoCantidad] = useState('1');
  const [tiempoUnidad, setTiempoUnidad] = useState('meses');
  const [periodo, setPeriodo] = useState('mensual');

  // Formulario editar
  const [editingGoal, setEditingGoal] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editMonto, setEditMonto] = useState('');
  const [editTiempoCantidad, setEditTiempoCantidad] = useState('');
  const [editTiempoUnidad, setEditTiempoUnidad] = useState('meses');
  const [editPeriodo, setEditPeriodo] = useState('mensual');

  // Formulario eliminar
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Formulario registrar cuotas
  const [activeGoal, setActiveGoal] = useState(null);
  const [cuotaType, setCuotaType] = useState('suggested'); // 'suggested' o 'custom'
  const [cuotaMonto, setCuotaMonto] = useState('');
  const [cuotaFecha, setCuotaFecha] = useState('');

  // Historial
  const [historyGoal, setHistoryGoal] = useState(null);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // COP Formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Get local date YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Realtime math calculation for estimated plans in creation
  const getPreviewCalculations = (amountStr, timeStr, unitStr, periodStr) => {
    const amountVal = parseFloat(amountStr) || 0;
    const timeVal = parseInt(timeStr, 10) || 0;
    if (amountVal <= 0 || timeVal <= 0) return null;

    let numCuotas = 0;
    if (unitStr === 'años') {
      if (periodStr === 'semanal') numCuotas = timeVal * 52;
      else if (periodStr === 'quincenal') numCuotas = timeVal * 24;
      else numCuotas = timeVal * 12;
    } else { // meses
      if (periodStr === 'semanal') numCuotas = Math.round(timeVal * 4.3333);
      else if (periodStr === 'quincenal') numCuotas = timeVal * 2;
      else numCuotas = timeVal;
    }

    if (numCuotas <= 0) numCuotas = 1;
    const cuotaMonto = Math.round(amountVal / numCuotas);

    return { numCuotas, cuotaMonto };
  };

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (isAdmin && filterOwner) params.ownerCode = filterOwner;
      const response = await api.get('/goals', { params });
      setGoals(response.data);
    } catch (err) {
      console.error('Error fetching savings goals:', err);
      setError(err.response?.data?.error || 'No se pudieron cargar las metas de ahorro.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const response = await api.get('/users');
      setUsersList(response.data);
    } catch (err) {
      console.error('Error loading user filter list:', err);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchUsers();
  }, [filterOwner]);

  const handleOpenModal = () => {
    setNombre('');
    setMonto('');
    setTiempoCantidad('1');
    setTiempoUnidad('meses');
    setPeriodo('mensual');
    setFormError('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setEditNombre(goal.nombre);
    setEditMonto(goal.monto);
    setEditTiempoCantidad(goal.tiempoCantidad);
    setEditTiempoUnidad(goal.tiempoUnidad);
    setEditPeriodo(goal.periodo);
    setFormError('');
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingGoal(null);
  };

  const handleOpenDeleteModal = (goal) => {
    setGoalToDelete(goal);
    setDeleteReason('');
    setFormError('');
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setGoalToDelete(null);
  };

  const handleOpenCuotaModal = (goal) => {
    setActiveGoal(goal);
    setCuotaType('suggested');
    setCuotaMonto(goal.montoCuotas);
    setCuotaFecha(getLocalDateString());
    setFormError('');
    setOpenCuotaModal(true);
  };

  const handleCloseCuotaModal = () => {
    setOpenCuotaModal(false);
    setActiveGoal(null);
  };

  const handleOpenHistoryModal = (goal) => {
    setHistoryGoal(goal);
    setOpenHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
    setHistoryGoal(null);
  };

  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    if (!nombre || !monto || !tiempoCantidad || !tiempoUnidad || !periodo) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(monto) || parseFloat(monto) <= 0) {
      setFormError('El monto debe ser un número positivo.');
      return;
    }
    if (isNaN(tiempoCantidad) || parseInt(tiempoCantidad, 10) <= 0) {
      setFormError('El tiempo debe ser un número positivo.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/goals', {
        nombre,
        monto: Number(monto),
        tiempoCantidad: Number(tiempoCantidad),
        tiempoUnidad,
        periodo
      });

      setSnackbar({
        open: true,
        message: 'Meta de ahorro registrada correctamente.',
        severity: 'success'
      });
      setOpenModal(false);
      fetchGoals();
    } catch (err) {
      console.error('Error creating goal:', err);
      setFormError(err.response?.data?.error || 'Error al guardar la meta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGoal = async (e) => {
    e.preventDefault();
    if (!editNombre || !editMonto || !editTiempoCantidad || !editTiempoUnidad || !editPeriodo) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(editMonto) || parseFloat(editMonto) <= 0) {
      setFormError('El monto debe ser un número positivo.');
      return;
    }
    if (isNaN(editTiempoCantidad) || parseInt(editTiempoCantidad, 10) <= 0) {
      setFormError('El tiempo debe ser un número positivo.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.put(`/goals/${editingGoal.id}`, {
        nombre: editNombre,
        monto: Number(editMonto),
        tiempoCantidad: Number(editTiempoCantidad),
        tiempoUnidad: editTiempoUnidad,
        periodo: editPeriodo
      });

      setSnackbar({
        open: true,
        message: 'Meta de ahorro actualizada correctamente.',
        severity: 'success'
      });
      setOpenEditModal(false);
      fetchGoals();
    } catch (err) {
      console.error('Error editing goal:', err);
      setFormError(err.response?.data?.error || 'Error al actualizar la meta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setFormError('');

    try {
      await api.delete(`/goals/${goalToDelete.id}`, {
        headers: {
          'x-delete-reason': deleteReason.trim() || 'Eliminación voluntaria por el usuario'
        }
      });

      setSnackbar({
        open: true,
        message: 'Meta de ahorro eliminada.',
        severity: 'success'
      });
      setOpenDeleteModal(false);
      fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      setFormError(err.response?.data?.error || 'Error al eliminar la meta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCuota = async (e) => {
    e.preventDefault();
    const finalMonto = cuotaType === 'suggested' ? activeGoal.montoCuotas : parseFloat(cuotaMonto);

    if (!finalMonto || isNaN(finalMonto) || finalMonto <= 0) {
      setFormError('El monto de la cuota debe ser un número positivo.');
      return;
    }
    if (!cuotaFecha) {
      setFormError('La fecha de registro es obligatoria.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post(`/goals/${activeGoal.id}/cuotas`, {
        monto: Number(finalMonto),
        fecha: cuotaFecha
      });

      setSnackbar({
        open: true,
        message: 'Aporte de cuota registrado exitosamente.',
        severity: 'success'
      });
      setOpenCuotaModal(false);
      fetchGoals();
    } catch (err) {
      console.error('Error saving cuota:', err);
      setFormError(err.response?.data?.error || 'Error al guardar el aporte.');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview estimation texts helper
  const creationPreview = getPreviewCalculations(monto, tiempoCantidad, tiempoUnidad, periodo);
  const editPreview = getPreviewCalculations(editMonto, editTiempoCantidad, editTiempoUnidad, editPeriodo);

  return (
    <Box className="tab-content">
      {/* Encabezado */}
      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(30, 58, 138, 0.05)', border: '1px solid #1e3a8a' }}>
            <FlagIcon sx={{ color: '#1e3a8a' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Metas de Ahorro
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Define tus objetivos financieros y haz seguimiento a tus planes de ahorro
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ fontWeight: 'bold', py: 1.2 }}
          >
            Nueva Meta de Ahorro
          </Button>
        </Grid>
      </Grid>

      {/* Selector de Administrador */}
      {isAdmin && (
        <Paper sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Filtrar metas por propietario:
          </Typography>
          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel id="filter-user-label">Propietario</InputLabel>
            <Select
              labelId="filter-user-label"
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              label="Propietario"
            >
              <MenuItem value="">Todos los Propietarios</MenuItem>
              {usersList.map((u) => (
                <MenuItem key={u.id} value={u.code}>
                  {u.name} ({u.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
          {error}
        </Alert>
      )}

      {/* Grid de Metas */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : goals.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
          No tienes metas de ahorro registradas actualmente. ¡Crea tu primera meta haciendo clic en "Nueva Meta de Ahorro"!
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.progreso / goal.monto) * 100)) || 0;
            return (
              <Grid item xs={12} md={6} lg={4} key={goal.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(11, 15, 25, 0.08)',
                    boxShadow: goal.completed ? '0 8px 30px rgba(16, 185, 129, 0.06)' : '0 8px 24px rgba(11, 15, 25, 0.02)',
                    borderLeft: goal.completed ? '5px solid #10b981' : '5px solid #1e3a8a',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 36px rgba(11, 15, 25, 0.06)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0b0f19' }}>
                          {goal.nombre}
                        </Typography>
                        {isAdmin && (
                          <Typography variant="caption" color="text.secondary">
                            Propietario: {goal.ownerName} ({goal.ownerCode})
                          </Typography>
                        )}
                      </Box>
                      {goal.completed ? (
                        <Chip
                          icon={<SuccessIcon sx={{ color: '#059669 !important' }} />}
                          label="META CUMPLIDA"
                          color="success"
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.7rem', 
                            letterSpacing: '0.5px',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            color: '#059669',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<ProgressIcon sx={{ color: '#1e3a8a !important' }} />}
                          label="EN PROGRESO"
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.7rem', 
                            letterSpacing: '0.5px',
                            backgroundColor: 'rgba(30, 58, 138, 0.05)',
                            color: '#1e3a8a',
                            border: '1px solid rgba(30, 58, 138, 0.15)'
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{ my: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0b0f19' }}>
                          Ahorrado: {formatCurrency(goal.progreso)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                          Meta: {formatCurrency(goal.monto)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percent} 
                        color={goal.completed ? "success" : "primary"}
                        sx={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(11, 15, 25, 0.05)' }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right', fontWeight: 'bold', color: goal.completed ? '#059669' : '#1e3a8a' }}>
                        {percent}% Completado
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <strong>Cuotas Planificadas:</strong> {goal.numeroCuotas} cuotas de {formatCurrency(goal.montoCuotas)} ({goal.periodo})
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <strong>Plazo original:</strong> {goal.tiempoCantidad} {goal.tiempoUnidad}
                    </Typography>

                    {!goal.completed ? (
                      <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(30, 58, 138, 0.03)', border: '1px dashed rgba(30, 58, 138, 0.15)' }}>
                        <Typography variant="body2" sx={{ color: '#dc2626', fontSize: '0.85rem', mb: 0.5, fontWeight: 700 }}>
                          Falta por ahorrar: {formatCurrency(goal.monto - goal.progreso)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1e3a8a', fontSize: '0.85rem', fontWeight: 700 }}>
                          Cuotas restantes: {Math.ceil((goal.monto - goal.progreso) / goal.montoCuotas)} cuotas {goal.periodo === 'mensual' ? 'mensuales' : goal.periodo === 'quincenal' ? 'quincenales' : 'semanales'}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(16, 185, 129, 0.03)', border: '1px dashed rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#059669', fontSize: '0.85rem', fontWeight: 800 }}>
                          🎉 ¡Enhorabuena, has alcanzado la meta!
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ borderTop: '1px solid rgba(11, 15, 25, 0.05)', p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Registrar Aporte / Cuota">
                        <IconButton 
                          onClick={() => handleOpenCuotaModal(goal)}
                          size="small"
                          disabled={goal.completed}
                          sx={{ 
                            color: '#1e3a8a', 
                            border: '1px solid rgba(30, 58, 138, 0.15)',
                            borderRadius: 1,
                            p: 0.8,
                            '&:hover': { backgroundColor: 'rgba(30, 58, 138, 0.05)' },
                            '&.Mui-disabled': { color: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,0,0,0.05)' }
                          }}
                        >
                          <CoinIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver Historial de Aportes">
                        <IconButton 
                          onClick={() => handleOpenHistoryModal(goal)}
                          size="small"
                          sx={{ 
                            color: '#475569', 
                            border: '1px solid rgba(71, 85, 105, 0.15)',
                            borderRadius: 1,
                            p: 0.8,
                            '&:hover': { backgroundColor: 'rgba(71, 85, 105, 0.05)' }
                          }}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleOpenEditModal(goal)}
                        size="small"
                        sx={{ 
                          color: '#1e3a8a', 
                          border: '1px solid rgba(30, 58, 138, 0.15)',
                          borderRadius: 1,
                          p: 0.8,
                          '&:hover': { backgroundColor: 'rgba(30, 58, 138, 0.05)' }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleOpenDeleteModal(goal)}
                        size="small"
                        sx={{ 
                          color: '#991b1b', 
                          border: '1px solid rgba(153, 27, 27, 0.15)',
                          borderRadius: 1,
                          p: 0.8,
                          '&:hover': { backgroundColor: 'rgba(153, 27, 27, 0.05)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialogo: Crear Meta */}
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
          Nueva Meta de Ahorro
        </DialogTitle>
        <form onSubmit={handleSubmitGoal}>
          <DialogContent sx={{ pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                {formError}
              </Alert>
            )}

            <TextField
              margin="normal"
              label="Nombre de la Meta"
              fullWidth
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Ahorro para vehículo"
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              label="Monto Objetivo (COP)"
              fullWidth
              required
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 10000000"
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  label="Tiempo / Plazo"
                  fullWidth
                  required
                  type="number"
                  value={tiempoCantidad}
                  onChange={(e) => setTiempoCantidad(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel id="time-unit-label">Unidad de Tiempo</InputLabel>
                  <Select
                    labelId="time-unit-label"
                    value={tiempoUnidad}
                    onChange={(e) => setTiempoUnidad(e.target.value)}
                    label="Unidad de Tiempo"
                  >
                    <MenuItem value="meses">Meses</MenuItem>
                    <MenuItem value="años">Años</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="periodo-label">Período de Ahorro</InputLabel>
              <Select
                labelId="periodo-label"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                label="Período de Ahorro"
              >
                <MenuItem value="semanal">Semanal</MenuItem>
                <MenuItem value="quincenal">Quincenal</MenuItem>
                <MenuItem value="mensual">Mensual</MenuItem>
              </Select>
            </FormControl>

            {/* Vista previa matemática */}
            {creationPreview && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(30, 58, 138, 0.03)', border: '1px dashed rgba(30, 58, 138, 0.2)' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', display: 'block', mb: 0.5 }}>
                  CÁLCULO AUTOMÁTICO DE PLAN DE AHORRO:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0b0f19' }}>
                  Deberás realizar un total de <strong>{creationPreview.numCuotas} cuotas</strong> {periodo === 'mensual' ? 'mensuales' : periodo === 'quincenal' ? 'quincenales' : 'semanales'} de aproximadamente:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, color: '#1e3a8a' }}>
                  {formatCurrency(creationPreview.cuotaMonto)}
                </Typography>
              </Box>
            )}
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

      {/* Dialogo: Editar Meta */}
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
          Editar Meta de Ahorro
        </DialogTitle>
        <form onSubmit={handleEditGoal}>
          <DialogContent sx={{ pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                {formError}
              </Alert>
            )}

            <TextField
              margin="normal"
              label="Nombre de la Meta"
              fullWidth
              required
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              label="Monto Objetivo (COP)"
              fullWidth
              required
              type="number"
              value={editMonto}
              onChange={(e) => setEditMonto(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  label="Tiempo / Plazo"
                  fullWidth
                  required
                  type="number"
                  value={editTiempoCantidad}
                  onChange={(e) => setEditTiempoCantidad(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel id="edit-time-unit-label">Unidad de Tiempo</InputLabel>
                  <Select
                    labelId="edit-time-unit-label"
                    value={editTiempoUnidad}
                    onChange={(e) => setEditTiempoUnidad(e.target.value)}
                    label="Unidad de Tiempo"
                  >
                    <MenuItem value="meses">Meses</MenuItem>
                    <MenuItem value="años">Años</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="edit-periodo-label">Período de Ahorro</InputLabel>
              <Select
                labelId="edit-periodo-label"
                value={editPeriodo}
                onChange={(e) => setEditPeriodo(e.target.value)}
                label="Período de Ahorro"
              >
                <MenuItem value="semanal">Semanal</MenuItem>
                <MenuItem value="quincenal">Quincenal</MenuItem>
                <MenuItem value="mensual">Mensual</MenuItem>
              </Select>
            </FormControl>

            {/* Vista previa matemática en edición */}
            {editPreview && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(30, 58, 138, 0.03)', border: '1px dashed rgba(30, 58, 138, 0.2)' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', display: 'block', mb: 0.5 }}>
                  RE-CÁLCULO AUTOMÁTICO DE PLAN:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0b0f19' }}>
                  El nuevo plan estima <strong>{editPreview.numCuotas} cuotas</strong> {editPeriodo === 'mensual' ? 'mensuales' : editPeriodo === 'quincenal' ? 'quincenales' : 'semanales'} de:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, color: '#1e3a8a' }}>
                  {formatCurrency(editPreview.cuotaMonto)}
                </Typography>
              </Box>
            )}
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
      </Dialog>

      {/* Dialogo: Confirmar Eliminación */}
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
        {goalToDelete && (
          <form onSubmit={handleDeleteGoal}>
            <DialogContent sx={{ pt: 1 }}>
              <Typography variant="body2" sx={{ mb: 3, color: '#0b0f19' }}>
                ¿Está seguro de que desea eliminar la meta de ahorro <strong>"{goalToDelete.nombre}"</strong> por valor total de <strong>{formatCurrency(goalToDelete.monto)}</strong>? Esta acción es definitiva.
              </Typography>
              <TextField
                margin="normal"
                label="Motivo de la Eliminación (Opcional)"
                fullWidth
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Ej: Re-evaluación del objetivo"
                variant="outlined"
                multiline
                rows={2}
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

      {/* Dialogo: Registrar Aporte / Cuota */}
      <Dialog 
        open={openCuotaModal} 
        onClose={handleCloseCuotaModal}
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
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Registrar Aporte / Abono
        </DialogTitle>
        {activeGoal && (
          <form onSubmit={handleSubmitCuota}>
            <DialogContent sx={{ pt: 1 }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                  {formError}
                </Alert>
              )}

              <Typography variant="subtitle2" sx={{ color: '#0b0f19', mb: 2 }}>
                Registra un ahorro en tu meta <strong>"{activeGoal.nombre}"</strong>. El saldo restante actual es <strong>{formatCurrency(activeGoal.monto - activeGoal.progreso)}</strong>.
              </Typography>

              <RadioGroup
                value={cuotaType}
                onChange={(e) => {
                  setCuotaType(e.target.value);
                  if (e.target.value === 'suggested') {
                    setCuotaMonto(activeGoal.montoCuotas);
                  } else {
                    setCuotaMonto('');
                  }
                }}
                sx={{ mb: 2 }}
              >
                <FormControlLabel 
                  value="suggested" 
                  control={<Radio />} 
                  label={`Abonar cuota sugerida: ${formatCurrency(activeGoal.montoCuotas)}`} 
                />
                <FormControlLabel 
                  value="custom" 
                  control={<Radio />} 
                  label="Abonar un monto personalizado (alcanzar meta más rápido)" 
                />
              </RadioGroup>

              {cuotaType === 'custom' && (
                <TextField
                  margin="normal"
                  label="Monto a Abonar (COP)"
                  fullWidth
                  required
                  type="number"
                  value={cuotaMonto}
                  onChange={(e) => setCuotaMonto(e.target.value)}
                  placeholder="Ej: 500000"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              )}

              <TextField
                margin="normal"
                label="Fecha de Aporte"
                type="date"
                fullWidth
                required
                value={cuotaFecha}
                onChange={(e) => setCuotaFecha(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <DateIcon sx={{ color: '#475569' }} />
                    </Box>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Informative message showing calculations remaining */}
              {activeGoal && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(30, 58, 138, 0.03)', border: '1px dashed rgba(30, 58, 138, 0.2)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', display: 'block', mb: 0.5 }}>
                    PREVISIÓN DE LA META TRAS EL APORTE:
                  </Typography>
                  {(() => {
                    const abono = cuotaType === 'suggested' ? activeGoal.montoCuotas : (parseFloat(cuotaMonto) || 0);
                    const nuevoProg = activeGoal.progreso + abono;
                    if (nuevoProg >= activeGoal.monto) {
                      return (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
                          🎉 ¡Con este aporte se cumplirá la meta de ahorro!
                        </Typography>
                      );
                    } else {
                      const rest = activeGoal.monto - nuevoProg;
                      const cuotasRestantes = Math.ceil(rest / activeGoal.montoCuotas);
                      return (
                        <Typography variant="body2" sx={{ color: '#0b0f19' }}>
                          Faltará ahorrar <strong>{formatCurrency(rest)}</strong>. Se requerirán aproximadamente <strong>{cuotasRestantes} cuotas</strong> de {formatCurrency(activeGoal.montoCuotas)} para completarla.
                        </Typography>
                      );
                    }
                  })()}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={handleCloseCuotaModal} variant="outlined" color="inherit">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={submitting}
                sx={{ minWidth: 100 }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Abonar'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Dialogo: Historial de Aportes */}
      <Dialog
        open={openHistoryModal}
        onClose={handleCloseHistoryModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: '#ffffff',
            border: '1px solid rgba(11, 15, 25, 0.12)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Historial de Aportes - "{historyGoal?.nombre}"
        </DialogTitle>
        <DialogContent dividers>
          {!historyGoal || !historyGoal.cuotas || historyGoal.cuotas.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
              No se han registrado aportes para esta meta de ahorro aún.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Monto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estado / Leyenda</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyGoal.cuotas.map((cuota, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#0b0f19' }}>{cuota.fecha}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                        {formatCurrency(cuota.monto)}
                      </TableCell>
                      <TableCell sx={{ color: cuota.leyenda.includes('cumplida') ? '#059669' : '#475569', fontWeight: cuota.leyenda.includes('cumplida') ? 'bold' : 'normal' }}>
                        {cuota.leyenda}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseHistoryModal} variant="contained" color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 1 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SavingsGoals;
