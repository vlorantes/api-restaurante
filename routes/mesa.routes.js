// manejando las rutas para los metodos de la seccion "Mesas"
const express = require('express')
// constante principal para manejar las rutas
const router = express.Router()
// llamando a los metodos a utilizar para las rutas
const {
    obtenerMesas,
    obtenerMesaById,
    crearMesa,
    actualizarMesa,
    desactivarMesa
} = require('../controller/mesa.controller')
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware')

// creando las rutas (/api/mesas)
router.get('/', obtenerMesas) // /api/v1/mesas/
// ruta con parametro
router.get('/:id', obtenerMesaById) // /api/v1/mesas/:id

// rutas protegidas
// antes de la accion, se agrega los permisos para entrar a esa ruta

router.post('/', verificarToken, verificarAdmin, crearMesa) // /api/v1/mesas/
router.put('/:id', verificarToken, verificarAdmin, actualizarMesa) // /api/v1/mesas/:id
// puede desactivar la mesa un cliente
router.patch('/:id', verificarToken, desactivarMesa) // /api/v1/mesas/:id

// exportando las rutas
module.exports = router