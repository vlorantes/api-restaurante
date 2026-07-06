const express = require('express')
const app = express()
// llamando las rutas de las mesas
const mesasRoutes = require('./routes/mesa.routes')
const reservacionesRoutes = require('./routes/reservaciones.routes') 
app.use(express.json())
const authRoutes = require('./routes/auth.routes')

app.listen(3000, () => {
    console.log("Hola, este es el servidor http://localhost:3000/")
})

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Bienvenidos a la API de Restaurante',
        descripcion: 'API que gestiona mesas y reservaciones en base al rol del usuario',
        version: '1.0.0',
    })
})

// usando las rutas de las mesas
app.use('/api/v1/mesas', mesasRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/reservaciones', reservacionesRoutes)