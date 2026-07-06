const jwt = require('jsonwebtoken')

// NOTA: Recuerda que para producción (la rúbrica te pide deploy), 
// lo ideal es usar process.env.JWT_SECRET en lugar de un string estático.
const SECRET = process.env.JWT_SECRET || 'clave_secreta_123'

// 1. Verifica que el token sea válido
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(401).json({ error: 'Debes de ingresar un token valido' })
    }

    // el header llega así: "Bearer eyJhbGci..."
    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, SECRET)
        
        // Estandarizado a req.user para que tus controladores lean correctamente el id y el rol
        req.user = decoded 
        
        next() 
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' })
    }
}

// 2. NUEVO: Verifica roles dinámicamente (Satisface las rutas de clientes y administradores)
const requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({ error: 'Error de servidor: Se requiere autenticación previa.' })
        }

        // Comprueba si el rol del usuario está dentro de los permitidos por la ruta
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ 
                error: `Acceso denegado, se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}` 
            })
        }
        
        next()
    }
}

// 3. Mantener tu verificarAdmin original adaptado a req.user por si lo usas en tus rutas de mesas
const verificarAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado, se requiere rol admin' })
    }
    next()
}

// Exportamos todas las funciones para que no falte ninguna en tus archivos de rutas
module.exports = { 
    verificarToken, 
    verificarAdmin, 
    requireRole // <-- Al exportar este, se solucionará el error que tenías en las rutas de reservaciones
}