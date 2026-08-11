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
  Radio,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Receipt as DebtIcon,
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

function ScheduledDebts() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [debts, setDebts] = useState([]);
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

  // Formulario deudas
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [tiempoCantidad, setTiempoCantidad] = useState('1');
  const [tiempoUnidad, setTiempoUnidad] = useState('meses');
  const [periodo, setPeriodo] = useState('mensual');

  // Formulario editar
  const [editingDebt, setEditingDebt] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editMonto, setEditMonto] = useState('');
  const [editTiempoCantidad, setEditTiempoCantidad] = useState('');
  const [editTiempoUnidad, setEditTiempoUnidad] = useState('meses');
  const [editPeriodo, setEditPeriodo] = useState('mensual');

  // Formulario eliminar
  const [debtToDelete, setDebtToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Formulario registrar cuotas
  const [activeDebt, setActiveDebt] = useState(null);
  const [cuotaType, setCuotaType] = useState('suggested'); // 'suggested' o 'custom'
  const [cuotaMonto, setCuotaMonto] = useState('');
  const [cuotaFecha, setCuotaFecha] = useState('');

  // Historial
  const [historyDebt, setHistoryDebt] = useState(null);

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
    } else if (unitStr === 'meses') {
      if (periodStr === 'semanal') numCuotas = Math.round(timeVal * 4.3333);
      else if (periodStr === 'quincenal') numCuotas = timeVal * 2;
      else numCuotas = timeVal;
    } else if (unitStr === 'quincenas') {
      if (periodStr === 'semanal') numCuotas = timeVal * 2;
      else if (periodStr === 'quincenal') numCuotas = timeVal;
      else numCuotas = Math.round(timeVal / 2);
    } else if (unitStr === 'semanas') {
      if (periodStr === 'semanal') numCuotas = timeVal;
      else if (periodStr === 'quincenal') numCuotas = Math.round(timeVal / 2);
      else numCuotas = Math.round(timeVal / 4.3333);
    }

    if (numCuotas <= 0) numCuotas = 1;
    const cuotaMonto = Math.round(amountVal / numCuotas);

    return { numCuotas, cuotaMonto };
  };

  const fetchDebts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (isAdmin && filterOwner) params.ownerCode = filterOwner;
      const response = await api.get('/debts', { params });
      setDebts(response.data);
    } catch (err) {
      console.error('Error fetching scheduled debts:', err);
      setError(err.response?.data?.error || 'No se pudieron cargar las deudas programadas.');
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
    fetchDebts();
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

  const handleOpenEditModal = (debt) => {
    setEditingDebt(debt);
    setEditNombre(debt.nombre);
    setEditMonto(debt.monto);
    setEditTiempoCantidad(debt.tiempoCantidad);
    setEditTiempoUnidad(debt.tiempoUnidad);
    setEditPeriodo(debt.periodo);
    setFormError('');
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingDebt(null);
  };

  const handleOpenDeleteModal = (debt) => {
    setDebtToDelete(debt);
    setDeleteReason('');
    setFormError('');
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDebtToDelete(null);
  };

  const handleOpenCuotaModal = (debt) => {
    setActiveDebt(debt);
    setCuotaType('suggested');
    setCuotaMonto(debt.montoCuotas);
    setCuotaFecha(getLocalDateString());
    setFormError('');
    setOpenCuotaModal(true);
  };

  const handleCloseCuotaModal = () => {
    setOpenCuotaModal(false);
    setActiveDebt(null);
  };

  const handleOpenHistoryModal = (debt) => {
    setHistoryDebt(debt);
    setOpenHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
    setHistoryDebt(null);
  };

  const handleSubmitDebt = async (e) => {
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
      await api.post('/debts', {
        nombre,
        monto: Number(monto),
        tiempoCantidad: Number(tiempoCantidad),
        tiempoUnidad,
        periodo
      });

      setSnackbar({
        open: true,
        message: 'Deuda programada registrada correctamente.',
        severity: 'success'
      });
      setOpenModal(false);
      fetchDebts();
    } catch (err) {
      console.error('Error creating debt:', err);
      setFormError(err.response?.data?.error || 'Error al guardar la deuda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDebt = async (e) => {
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
      await api.put(`/debts/${editingDebt.id}`, {
        nombre: editNombre,
        monto: Number(editMonto),
        tiempoCantidad: Number(editTiempoCantidad),
        tiempoUnidad: editTiempoUnidad,
        periodo: editPeriodo
      });

      setSnackbar({
        open: true,
        message: 'Deuda programada actualizada correctamente.',
        severity: 'success'
      });
      setOpenEditModal(false);
      fetchDebts();
    } catch (err) {
      console.error('Error editing debt:', err);
      setFormError(err.response?.data?.error || 'Error al actualizar la deuda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDebt = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setFormError('');

    try {
      await api.delete(`/debts/${debtToDelete.id}`, {
        headers: {
          'x-delete-reason': deleteReason.trim() || 'Eliminación voluntaria por el usuario'
        }
      });

      setSnackbar({
        open: true,
        message: 'Deuda programada eliminada.',
        severity: 'success'
      });
      setOpenDeleteModal(false);
      fetchDebts();
    } catch (err) {
      console.error('Error deleting debt:', err);
      setFormError(err.response?.data?.error || 'Error al eliminar la deuda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCuota = async (e) => {
    e.preventDefault();
    const finalMonto = cuotaType === 'suggested' ? activeDebt.montoCuotas : parseFloat(cuotaMonto);

    if (!finalMonto || isNaN(finalMonto) || finalMonto <= 0) {
      setFormError('El monto del pago debe ser un número positivo.');
      return;
    }
    if (!cuotaFecha) {
      setFormError('La fecha de registro es obligatoria.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post(`/debts/${activeDebt.id}/cuotas`, {
        monto: Number(finalMonto),
        fecha: cuotaFecha
      });

      setSnackbar({
        open: true,
        message: 'Pago de cuota registrado exitosamente.',
        severity: 'success'
      });
      setOpenCuotaModal(false);
      fetchDebts();
    } catch (err) {
      console.error('Error saving cuota:', err);
      setFormError(err.response?.data?.error || 'Error al guardar el pago.');
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
            <DebtIcon sx={{ color: '#1e3a8a' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Deudas Programadas
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Define tus obligaciones financieras y haz seguimiento a tus planes de pago
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
            Nueva Deuda Programada
          </Button>
        </Grid>
      </Grid>

      {/* Selector de Administrador */}
      {isAdmin && (
        <Paper sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Filtrar deudas por propietario:
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

      {/* Grid de Deudas */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : debts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
          No tienes deudas programadas registradas actualmente. ¡Crea tu primera deuda haciendo clic en "Nueva Deuda Programada"!
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {debts.map((debt) => {
            const percent = Math.min(100, Math.round((debt.progreso / debt.monto) * 100)) || 0;
            return (
              <Grid item xs={12} md={6} lg={4} key={debt.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(11, 15, 25, 0.08)',
                    boxShadow: debt.completed ? '0 8px 30px rgba(16, 185, 129, 0.06)' : '0 8px 24px rgba(11, 15, 25, 0.02)',
                    borderLeft: debt.completed ? '5px solid #10b981' : '5px solid #1e3a8a',
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
                          {debt.nombre}
                        </Typography>
                        {isAdmin && (
                          <Typography variant="caption" color="text.secondary">
                            Propietario: {debt.ownerName} ({debt.ownerCode})
                          </Typography>
                        )}
                      </Box>
                      {debt.completed ? (
                        <Chip
                          icon={<SuccessIcon sx={{ color: '#059669 !important' }} />}
                          label="DEUDA SALDADA"
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
                          Pagado: {formatCurrency(debt.progreso)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                          Deuda total: {formatCurrency(debt.monto)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percent} 
                        color={debt.completed ? "success" : "primary"}
                        sx={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(11, 15, 25, 0.05)' }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right', fontWeight: 'bold', color: debt.completed ? '#059669' : '#1e3a8a' }}>
                        {percent}% Completado
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <strong>Cuotas Planificadas:</strong> {debt.numeroCuotas} cuotas de {formatCurrency(debt.montoCuotas)} ({debt.periodo})
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <strong>Plazo original:</strong> {debt.tiempoCantidad} {debt.tiempoUnidad}
                    </Typography>

                    {!debt.completed ? (
                      <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(30, 58, 138, 0.03)', border: '1px dashed rgba(30, 58, 138, 0.15)' }}>
                        <Typography variant="body2" sx={{ color: '#dc2626', fontSize: '0.85rem', mb: 0.5, fontWeight: 700 }}>
                          Falta por pagar: {formatCurrency(debt.monto - debt.progreso)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1e3a8a', fontSize: '0.85rem', fontWeight: 700 }}>
                          Cuotas restantes: {Math.ceil((debt.monto - debt.progreso) / debt.montoCuotas)} cuotas {debt.periodo === 'mensual' ? 'mensuales' : debt.periodo === 'quincenal' ? 'quincenales' : 'semanales'}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(16, 185, 129, 0.03)', border: '1px dashed rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#059669', fontSize: '0.85rem', fontWeight: 800 }}>
                          🎉 ¡Enhorabuena, has saldado la deuda!
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ borderTop: '1px solid rgba(11, 15, 25, 0.05)', p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Registrar Pago / Cuota">
                        <IconButton 
                          onClick={() => handleOpenCuotaModal(debt)}
                          size="small"
                          disabled={debt.completed}
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
                      <Tooltip title="Ver Historial de Pagos">
                        <IconButton 
                          onClick={() => handleOpenHistoryModal(debt)}
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
                        onClick={() => handleOpenEditModal(debt)}
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
                        onClick={() => handleOpenDeleteModal(debt)}
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

      {/* Dialogo: Crear Deuda */}
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
          Nueva Deuda Programada
        </DialogTitle>
        <form onSubmit={handleSubmitDebt}>
          <DialogContent sx={{ pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                {formError}
              </Alert>
            )}

            <TextField
              margin="normal"
              label="Nombre de la Deuda"
              fullWidth
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Pago de tarjeta de crédito"
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              label="Deuda total (COP)"
              fullWidth
              required
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 5000000"
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setTiempoUnidad(val);
                      setPeriodo(
                        val === 'semanas' ? 'semanal' :
                        val === 'quincenas' ? 'quincenal' : 'mensual'
                      );
                    }}
                    label="Unidad de Tiempo"
                  >
                    <MenuItem value="semanas">Semanas</MenuItem>
                    <MenuItem value="quincenas">Quincenas</MenuItem>
                    <MenuItem value="meses">Meses</MenuItem>
                    <MenuItem value="años">Años</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Vista previa matemática */}
            {creationPreview && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(30, 58, 138, 0.03)', border: '1px dashed rgba(30, 58, 138, 0.2)' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', display: 'block', mb: 0.5 }}>
                  CÁLCULO AUTOMÁTICO DE PLAN DE PAGOS:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0b0f19' }}>
                  Deberás realizar un total de <strong>{creationPreview.numCuotas} pagos</strong> {periodo === 'mensual' ? 'mensuales' : periodo === 'quincenal' ? 'quincenales' : 'semanales'} de aproximadamente:
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

      {/* Dialogo: Editar Deuda */}
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
          Editar Deuda Programada
        </DialogTitle>
        <form onSubmit={handleEditDebt}>
          <DialogContent sx={{ pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                {formError}
              </Alert>
            )}

            <TextField
              margin="normal"
              label="Nombre de la Deuda"
              fullWidth
              required
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              label="Deuda total (COP)"
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditTiempoUnidad(val);
                      setEditPeriodo(
                        val === 'semanas' ? 'semanal' :
                        val === 'quincenas' ? 'quincenal' : 'mensual'
                      );
                    }}
                    label="Unidad de Tiempo"
                  >
                    <MenuItem value="semanas">Semanas</MenuItem>
                    <MenuItem value="quincenas">Quincenas</MenuItem>
                    <MenuItem value="meses">Meses</MenuItem>
                    <MenuItem value="años">Años</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Vista previa matemática en edición */}
            {editPreview && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(30, 58, 138, 0.03)', border: '1px dashed rgba(30, 58, 138, 0.2)' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', display: 'block', mb: 0.5 }}>
                  RE-CÁLCULO AUTOMÁTICO DE PLAN:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0b0f19' }}>
                  El nuevo plan estima <strong>{editPreview.numCuotas} pagos</strong> {editPeriodo === 'mensual' ? 'mensuales' : editPeriodo === 'quincenal' ? 'quincenales' : 'semanales'} de:
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
        {debtToDelete && (
          <form onSubmit={handleDeleteDebt}>
            <DialogContent sx={{ pt: 1 }}>
              <Typography variant="body2" sx={{ mb: 3, color: '#0b0f19' }}>
                ¿Está seguro de que desea eliminar la deuda programada <strong>"{debtToDelete.nombre}"</strong> por valor total de <strong>{formatCurrency(debtToDelete.monto)}</strong>? Esta acción es definitiva.
              </Typography>
              <TextField
                margin="normal"
                label="Motivo de la Eliminación (Opcional)"
                fullWidth
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Ej: Re-evaluación de la obligación"
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

      {/* Dialogo: Registrar Pago / Cuota */}
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
          Registrar Pago / Abono
        </DialogTitle>
        {activeDebt && (
          <form onSubmit={handleSubmitCuota}>
            <DialogContent sx={{ pt: 1 }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                  {formError}
                </Alert>
              )}

              <Typography variant="subtitle2" sx={{ color: '#0b0f19', mb: 2 }}>
                Registra un pago en tu deuda <strong>"{activeDebt.nombre}"</strong>. El saldo restante actual es <strong>{formatCurrency(activeDebt.monto - activeDebt.progreso)}</strong>.
              </Typography>

              <RadioGroup
                value={cuotaType}
                onChange={(e) => {
                  setCuotaType(e.target.value);
                  if (e.target.value === 'suggested') {
                    setCuotaMonto(activeDebt.montoCuotas);
                  } else {
                    setCuotaMonto('');
                  }
                }}
                sx={{ mb: 2 }}
              >
                <FormControlLabel 
                  value="suggested" 
                  control={<Radio />} 
                  label={`Pagar cuota sugerida: ${formatCurrency(activeDebt.montoCuotas)}`} 
                />
                <FormControlLabel 
                  value="custom" 
                  control={<Radio />} 
                  label="Pagar un monto personalizado (saldar deuda más rápido)" 
                />
              </RadioGroup>

              {cuotaType === 'custom' && (
                <TextField
                  margin="normal"
                  label="Monto a Pagar (COP)"
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
                label="Fecha de Pago"
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
              {activeDebt && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(30, 58, 138, 0.03)', border: '1px dashed rgba(30, 58, 138, 0.2)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', display: 'block', mb: 0.5 }}>
                    PREVISIÓN DE LA DEUDA TRAS EL PAGO:
                  </Typography>
                  {(() => {
                    const abono = cuotaType === 'suggested' ? activeDebt.montoCuotas : (parseFloat(cuotaMonto) || 0);
                    const nuevoProg = activeDebt.progreso + abono;
                    if (nuevoProg >= activeDebt.monto) {
                      return (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
                          🎉 ¡Con este pago se saldará la deuda programada!
                        </Typography>
                      );
                    } else {
                      const rest = activeDebt.monto - nuevoProg;
                      const cuotasRestantes = Math.ceil(rest / activeDebt.montoCuotas);
                      return (
                        <Typography variant="body2" sx={{ color: '#0b0f19' }}>
                          Faltará pagar <strong>{formatCurrency(rest)}</strong>. Se requerirán aproximadamente <strong>{cuotasRestantes} pagos</strong> de {formatCurrency(activeDebt.montoCuotas)} para saldarla.
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
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Pagar'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Dialogo: Historial de Pagos */}
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
          Historial de Pagos - "{historyDebt?.nombre}"
        </DialogTitle>
        <DialogContent dividers>
          {!historyDebt || !historyDebt.cuotas || historyDebt.cuotas.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
              No se han registrado pagos para esta deuda programada aún.
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
                  {historyDebt.cuotas.map((cuota, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#0b0f19' }}>{cuota.fecha}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                        {formatCurrency(cuota.monto)}
                      </TableCell>
                      <TableCell sx={{ color: cuota.leyenda.includes('pagada') || cuota.leyenda.includes('saldada') ? '#059669' : '#475569', fontWeight: cuota.leyenda.includes('pagada') || cuota.leyenda.includes('saldada') ? 'bold' : 'normal' }}>
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

export default ScheduledDebts;
