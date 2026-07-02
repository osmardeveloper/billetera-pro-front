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
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Checkbox,
  ListItemText,
  OutlinedInput,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../App';
import api from '../api';

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', color: '#0b0f19', bgColor: '#f1efe9', borderColor: 'rgba(11, 15, 25, 0.15)' },
  { id: 'nequi', label: 'Nequi', color: '#0b0f19', bgColor: '#f1efe9', borderColor: 'rgba(11, 15, 25, 0.15)' },
  { id: 'bancolombia', label: 'Bancolombia', color: '#0b0f19', bgColor: '#f1efe9', borderColor: 'rgba(11, 15, 25, 0.15)' }
];

const CATEGORIES = [
  'Transporte',
  'Gasolina',
  'Servicios publicos',
  'Internet y telefonia',
  'Vehiculo y mantenimiento',
  'Arriendo',
  'Mercado y alimentacion',
  'Meriendas',
  'Salud y medicamentos',
  'Ropa y calzado',
  'Educacion',
  'Creditos',
  'Suscripciones IA',
  'Articulos y artefactos del hogar',
  'Entretenimiento y salidas',
  'Restaurantes y comidas fuera',
  'Otros gastos'
];

function Expenses() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  // Core Data States
  const [expenses, setExpenses] = useState([]);
  const [usersList, setUsersList] = useState([]); // Loaded if admin for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters State
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterMethods, setFilterMethods] = useState([]);
  const [filterOwner, setFilterOwner] = useState('');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // New Expense Modal State
  const [openModal, setOpenModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('efectivo');
  const [categoria, setCategoria] = useState('Otros gastos');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  // Edit Expense Modal State
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMethod, setEditMethod] = useState('efectivo');
  const [editCategoria, setEditCategoria] = useState('Otros gastos');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [filterCategories, setFilterCategories] = useState([]);

  // Delete Expense Modal State
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get local date YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterMethods.length > 0) params.methods = filterMethods.join(',');
      if (filterCategories.length > 0) params.categorias = filterCategories.join(',');
      if (isAdmin && filterOwner) params.ownerCode = filterOwner;

      const response = await api.get('/expenses', { params });
      setExpenses(response.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.error || 'No se pudieron cargar los gastos.');
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
      console.error('Error fetching users list for dropdown:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchUsers();
  }, [filterStartDate, filterEndDate, filterMethods, filterCategories, filterOwner]);

  const handleOpenModal = () => {
    setAmount('');
    setMethod('efectivo');
    setCategoria('Otros gastos');
    setDate(getLocalDateString());
    setDescription('');
    setFormError('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount);
    setEditMethod(expense.method.toLowerCase());
    setEditDate(expense.date);
    setEditDescription(expense.description || '');
    setEditCategoria(expense.categoria || 'Otros gastos');
    setFormError('');
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingExpense(null);
  };

  const handleOpenDeleteModal = (expense) => {
    setExpenseToDelete(expense);
    setDeleteReason('');
    setFormError('');
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setExpenseToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !method || !date) {
      setFormError('Los campos monto, método y fecha son obligatorios.');
      return;
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      setFormError('El monto debe ser un número positivo.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/expenses', {
        amount: Number(amount),
        method,
        date,
        description,
        categoria
      });

      setSnackbar({
        open: true,
        message: 'Gasto registrado correctamente.',
        severity: 'success'
      });
      setOpenModal(false);
      setPage(0);
      fetchExpenses(); // Refresh table
    } catch (err) {
      console.error('Error creating expense:', err);
      setFormError(err.response?.data?.error || 'Error al guardar el gasto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editAmount) {
      setFormError('El campo monto es obligatorio.');
      return;
    }
    if (!editMethod) {
      setFormError('El campo método de pago es obligatorio.');
      return;
    }
    if (!editDate) {
      setFormError('El campo fecha es obligatorio.');
      return;
    }

    if (isNaN(editAmount) || Number(editAmount) <= 0) {
      setFormError('El monto debe ser un número positivo.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.put(`/expenses/${editingExpense.id}`, {
        amount: Number(editAmount),
        method: editMethod,
        date: editDate,
        description: editDescription,
        categoria: editCategoria
      });

      setSnackbar({
        open: true,
        message: 'Gasto actualizado correctamente.',
        severity: 'success'
      });
      setOpenEditModal(false);
      fetchExpenses(); // Refresh table
    } catch (err) {
      console.error('Error updating expense:', err);
      setFormError(err.response?.data?.error || 'Error al actualizar el gasto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) {
      setFormError('El motivo de la eliminación es obligatorio.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.delete(`/expenses/${expenseToDelete.id}`, {
        headers: {
          'x-delete-reason': deleteReason
        }
      });

      setSnackbar({
        open: true,
        message: 'Gasto eliminado correctamente.',
        severity: 'success'
      });
      setOpenDeleteModal(false);
      fetchExpenses(); // Refresh table
    } catch (err) {
      console.error('Error deleting expense:', err);
      setFormError(err.response?.data?.error || 'Error al eliminar el gasto.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterMethods([]);
    setFilterCategories([]);
    setFilterOwner('');
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // COP Currency formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Statistics calculation based on currently filtered list
  const stats = expenses.reduce((acc, exp) => {
    acc.total += exp.amount;
    if (exp.method === 'efectivo') acc.efectivo += exp.amount;
    if (exp.method === 'nequi') acc.nequi += exp.amount;
    if (exp.method === 'bancolombia') acc.bancolombia += exp.amount;
    return acc;
  }, { total: 0, efectivo: 0, nequi: 0, bancolombia: 0 });

  return (
    <Box className="tab-content">
      
      {/* 1. Header Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} sm={8}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Listado de Gastos Registrados
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Consulte y filtre los egresos monetarios de los propietarios
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ fontWeight: 'bold', py: 1.2 }}
          >
            Registrar Gasto
          </Button>
        </Grid>
      </Grid>

      {/* 2. Uniform Stats Dashboard Panels */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid #1e3a8a', // Accent bar
            borderColor: 'rgba(11, 15, 25, 0.08)',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
                TOTAL EN GASTOS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#1e3a8a' }}>
                {formatCurrency(stats.total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid #475569', // Accent bar
            borderColor: 'rgba(11, 15, 25, 0.08)',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
                NEQUI
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#0b0f19' }}>
                {formatCurrency(stats.nequi)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid #475569', // Accent bar
            borderColor: 'rgba(11, 15, 25, 0.08)',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
                BANCOLOMBIA
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#0b0f19' }}>
                {formatCurrency(stats.bancolombia)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid #475569', // Accent bar
            borderColor: 'rgba(11, 15, 25, 0.08)',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
                EFECTIVO
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#0b0f19' }}>
                {formatCurrency(stats.efectivo)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Filters Panel */}
      <Paper sx={{ p: 3, mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <FilterIcon sx={{ color: '#1e3a8a', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
            FILTRADO AVANZADO
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Fecha Inicio"
              type="date"
              fullWidth
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Fecha Fin"
              type="date"
              fullWidth
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth>
              <InputLabel id="filter-method-label">Método de Pago</InputLabel>
              <Select
                labelId="filter-method-label"
                multiple
                value={filterMethods}
                onChange={(e) => setFilterMethods(e.target.value)}
                input={<OutlinedInput label="Método de Pago" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const methodObj = PAYMENT_METHODS.find(m => m.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={methodObj?.label || value} 
                          size="small"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.75rem', 
                            color: '#0b0f19',
                            backgroundColor: '#f1efe9',
                            border: '1px solid rgba(11, 15, 25, 0.15)'
                          }} 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {PAYMENT_METHODS.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    <Checkbox checked={filterMethods.indexOf(m.id) > -1} size="small" />
                    <ListItemText primary={m.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth>
              <InputLabel id="filter-category-label">Categorías</InputLabel>
              <Select
                labelId="filter-category-label"
                multiple
                value={filterCategories}
                onChange={(e) => setFilterCategories(e.target.value)}
                input={<OutlinedInput label="Categorías" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.75rem', 
                          color: '#0b0f19',
                          backgroundColor: '#f1efe9',
                          border: '1px solid rgba(11, 15, 25, 0.15)'
                        }} 
                      />
                    ))}
                  </Box>
                )}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    <Checkbox checked={filterCategories.indexOf(cat) > -1} size="small" />
                    <ListItemText primary={cat} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {isAdmin && (
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="filter-owner-label">Propietario</InputLabel>
                <Select
                  labelId="filter-owner-label"
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
            </Grid>
          )}

          <Grid item xs={12} md={isAdmin ? 1 : 3} sx={{ textAlign: 'right' }}>
            <Tooltip title="Limpiar Filtros">
              <IconButton 
                onClick={clearFilters}
                disabled={!filterStartDate && !filterEndDate && filterMethods.length === 0 && filterCategories.length === 0 && !filterOwner}
                sx={{ 
                  color: '#991b1b',
                  border: '1px solid rgba(153, 27, 27, 0.15)',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(153, 27, 27, 0.05)',
                    borderColor: '#991b1b'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* 4. Table / List */}
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
          <Table sx={{ minWidth: 650 }} aria-label="expenses table">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Propietario</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="center">Categoría</TableCell>
                <TableCell align="center">Método de Pago</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No se encontraron gastos registrados con los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                expenses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const methodObj = PAYMENT_METHODS.find(m => m.id === row.method.toLowerCase());
                    return (
                      <TableRow key={row.id}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{row.date}</span>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {row.createdAt ? new Date(row.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0b0f19' }}>{row.ownerName}</Typography>
                            <Typography variant="caption" color="text.secondary">Código: {row.ownerCode}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.description || 'Sin descripción'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={row.categoria || 'Otros gastos'}
                            size="small"
                            sx={{
                              fontWeight: '600',
                              color: '#1e3a8a',
                              backgroundColor: 'rgba(30, 58, 138, 0.05)',
                              border: '1px solid rgba(30, 58, 138, 0.15)',
                              px: 0.5
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={methodObj?.label || row.method}
                            size="small"
                            sx={{
                              fontWeight: 'bold',
                              color: '#0b0f19',
                              backgroundColor: '#f1efe9',
                              border: '1px solid rgba(11, 15, 25, 0.15)',
                              px: 1
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#0b0f19' }}>
                          {formatCurrency(row.amount)}
                        </TableCell>
                        <TableCell align="center">
                          {(isAdmin || row.ownerCode === user.code) && (
                            <>
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
                                sx={{
                                  border: '1px solid rgba(153, 27, 27, 0.15)',
                                  color: '#991b1b',
                                  borderRadius: 1,
                                  p: 0.8,
                                  ml: 1,
                                  '&:hover': {
                                    backgroundColor: 'rgba(153, 27, 27, 0.05)'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={expenses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          borderTop: '1px solid rgba(11, 15, 25, 0.06)',
          color: '#0b0f19',
          '& .MuiTablePagination-selectIcon': {
            color: '#0b0f19'
          },
          '& .MuiTablePagination-actions .MuiIconButton-root': {
            color: '#0b0f19'
          }
        }}
      />

      {/* Register Expense Modal */}
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
          Registrar Gasto
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(153, 27, 27, 0.05)', border: '1px solid #991b1b', color: '#991b1b', borderRadius: 1 }}>
                {formError}
              </Alert>
            )}

            {/* Auto-Assignment Notification */}
            <Box 
              sx={{ 
                mb: 2, 
                p: 2, 
                bgcolor: 'rgba(30, 58, 138, 0.04)', 
                borderRadius: 1, 
                border: '1px solid rgba(30, 58, 138, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Propietario del Gasto
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0b0f19' }}>
                {user.name} ({user.code})
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                El gasto se registrará automáticamente a tu nombre.
              </Typography>
            </Box>

            <TextField
              margin="normal"
              label="Monto ($)"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 50000"
              variant="outlined"
              sx={{ mb: 2 }}
              inputProps={{ min: 0 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel id="method-select-label">Método de Pago</InputLabel>
                  <Select
                    labelId="method-select-label"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    label="Método de Pago"
                  >
                    <MenuItem value="efectivo">Efectivo</MenuItem>
                    <MenuItem value="nequi">Nequi</MenuItem>
                    <MenuItem value="bancolombia">Bancolombia</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  label="Fecha"
                  type="date"
                  fullWidth
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="category-select-label">Categoría</InputLabel>
              <Select
                labelId="category-select-label"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                label="Categoría"
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              label="Descripción / Concepto"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de internet, Mercado, etc."
              variant="outlined"
              multiline
              rows={2}
              sx={{ mb: 1 }}
            />
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
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Registrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Expense Modal */}
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
          Editar Gasto
        </DialogTitle>
        {editingExpense && (
          <form onSubmit={handleEditSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(153, 27, 27, 0.05)', border: '1px solid #991b1b', color: '#991b1b', borderRadius: 1 }}>
                  {formError}
                </Alert>
              )}

              <Box 
                sx={{ 
                  mb: 2, 
                  p: 2, 
                  bgcolor: 'rgba(30, 58, 138, 0.04)', 
                  borderRadius: 1, 
                  border: '1px solid rgba(30, 58, 138, 0.12)'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', display: 'block', mb: 0.5 }}>
                  PROPIETARIO ASOCIADO AL GASTO:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0b0f19' }}>
                  {editingExpense.ownerName} ({editingExpense.ownerCode})
                </Typography>
              </Box>

              <TextField
                margin="normal"
                label="Monto ($)"
                type="number"
                fullWidth
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Ej: 50000"
                variant="outlined"
                sx={{ mb: 2 }}
                inputProps={{ min: 0 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="edit-method-select-label">Método de Pago</InputLabel>
                    <Select
                      labelId="edit-method-select-label"
                      value={editMethod}
                      onChange={(e) => setEditMethod(e.target.value)}
                      label="Método de Pago"
                    >
                      <MenuItem value="efectivo">Efectivo</MenuItem>
                      <MenuItem value="nequi">Nequi</MenuItem>
                      <MenuItem value="bancolombia">Bancolombia</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    margin="normal"
                    label="Fecha"
                    type="date"
                    fullWidth
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
                <InputLabel id="edit-category-select-label">Categoría</InputLabel>
                <Select
                  labelId="edit-category-select-label"
                  value={editCategoria}
                  onChange={(e) => setEditCategoria(e.target.value)}
                  label="Categoría"
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                label="Descripción / Concepto"
                fullWidth
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Ej: Pago de internet, Mercado, etc."
                variant="outlined"
                multiline
                rows={2}
                sx={{ mb: 2 }}
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

      {/* Delete Expense Modal */}
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
          Confirmar Eliminación de Gasto
        </DialogTitle>
        {expenseToDelete && (
          <form onSubmit={handleDeleteSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(153, 27, 27, 0.05)', border: '1px solid #991b1b', color: '#991b1b', borderRadius: 1 }}>
                  {formError}
                </Alert>
              )}
              <Typography variant="body2" sx={{ mb: 3, color: '#0b0f19' }}>
                ¿Está seguro de que desea eliminar el gasto de <strong>{formatCurrency(expenseToDelete.amount)}</strong> registrado a nombre de <strong>{expenseToDelete.ownerName}</strong> el {expenseToDelete.date}?
              </Typography>
              
              <TextField
                margin="normal"
                label="Motivo de la Eliminación"
                fullWidth
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Ej: Corrección de valor o método erróneo"
                variant="outlined"
                multiline
                rows={2}
                sx={{ mb: 2 }}
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

export default Expenses;
