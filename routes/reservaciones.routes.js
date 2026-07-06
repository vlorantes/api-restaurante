const express = require('express');
const router = express.Router();
const reservacionController = require('../controller/reservacion.controller');

// 1. CORRECCIÓN AQUÍ: Asegúrate de importar "verificarToken" y "requireRole"
const { verificarToken, requireRole } = require('../middleware/auth.middleware');

// =======================================================
// PROTECCIÓN GLOBAL: Usamos el nombre en español que tú tenías
// =======================================================
router.use(verificarToken);

// =======================================================
// RUTAS PARA ROLES: CLIENTE
// =======================================================

// POST /api/reservaciones -> Crear reservación
router.post('/', requireRole(['cliente']), reservacionController.crearReservacion);

// GET /api/reservaciones/mis -> Ver mis reservaciones
router.get('/mis', requireRole(['cliente']), reservacionController.obtenerMisReservaciones);

// DELETE /api/reservaciones/:id -> Cancelar propia reservación
router.delete('/:id', requireRole(['cliente']), reservacionController.cancelarPropiaReservacion);


// =======================================================
// RUTAS PARA ROLES: ADMIN
// =======================================================

// GET /api/reservaciones -> Todas las reservaciones
router.get('/', requireRole(['admin']), reservacionController.obtenerTodasReservaciones);

// PUT /api/reservaciones/:id/estado -> Cambiar estado de reservación
router.put('/:id/estado', requireRole(['admin']), reservacionController.cambiarEstadoReservacion);

module.exports = router;