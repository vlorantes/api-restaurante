const express = require('express')
const router = express.Router()
const { registro, login, perfil } = require('../controller/auth.controller')
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware')

router.post('/register', registro) // /api/v1/auth/register
router.post('/login', login) // /api/v1/auth/login

// RUTA PROTEGIDA
router.get('/perfil', verificarToken, perfil)

module.exports = router