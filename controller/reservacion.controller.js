const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Crear reservación (Valida disponibilidad - Solo Clientes)
const crearReservacion = async (req, res) => {
    try {
        const { mesaId, fecha, hora, personas } = req.body;
        const usuarioId = req.user.id; // Extraído de tu middleware de autenticación

        // Convertir la fecha que llega en string a un objeto Date puro para comparar con @db.Date
        const fechaReserva = new Date(fecha);

        // LOGICA CENTRAL: Validar que la misma mesa no tenga una reserva activa esa misma fecha y hora
        // En Prisma, @db.Time de Postgres se puede comparar enviando la string de la hora (ej: "12:00:00")
        const reservaExistente = await prisma.reservacion.findFirst({
            where: {
                mesaId: parseInt(mesaId),
                fecha: fechaReserva,
                hora: hora, // El formato que envíes en el JSON (ej. "12:00") debe coincidir
                estado: { not: 'cancelada' } // Excluye las canceladas
            }
        });

        if (reservaExistente) {
            return res.status(400).json({ 
                message: 'La mesa seleccionada ya está reservada para esa fecha y hora.' 
            });
        }

        // Crear registro usando los nombres exactos de tu modelo Prisma
        const nuevaReserva = await prisma.reservacion.create({
            data: {
                usuarioId: parseInt(usuarioId),
                mesaId: parseInt(mesaId),
                fecha: fechaReserva,
                hora: hora,
                personas: parseInt(personas),
                estado: 'pendiente' // Valor por defecto del enum Estado
            }
        });

        return res.status(201).json({ message: 'Reservación creada exitosamente', nuevaReserva });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear la reservación', error: error.message });
    }
};

// 2. Mis reservaciones (Usuario actual - Solo Clientes)
const obtenerMisReservaciones = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const misReservas = await prisma.reservacion.findMany({
            where: { usuarioId },
            include: { mesa: true } // "mesa" en minúscula según la relación de tu modelo
        });
        return res.status(200).json(misReservas);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener tus reservaciones', error: error.message });
    }
};

// 3. Todas las reservaciones con filtros (Solo Administradores)
const obtenerTodasReservaciones = async (req, res) => {
    try {
        const { estado, fecha } = req.query;
        let filtros = {};

        if (estado) filtros.estado = estado;
        if (fecha) filtros.fecha = new Date(fecha);

        const reservaciones = await prisma.reservacion.findMany({
            where: filtros,
            include: {
                usuario: {
                    select: { id: true, nombre: true, correo: true } // Evitamos exponer el password
                },
                mesa: true
            }
        });
        return res.status(200).json(reservaciones);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener las reservaciones', error: error.message });
    }
};

// 4. Cambiar estado de reservación (Solo Administradores)
const cambiarEstadoReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // Debe ser 'confirmada', 'pendiente' o 'cancelada'

        if (!['pendiente', 'confirmada', 'cancelada'].includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido.' });
        }

        const reservaActualizada = await prisma.reservacion.update({
            where: { id: parseInt(id) },
            data: { estado }
        });

        return res.status(200).json({ message: 'Estado actualizado correctamente', reservaActualizada });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
    }
};

// 5. Cancelar propia reservación (Solo Clientes)
const cancelarPropiaReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.user.id;

        // Buscar la reserva para comprobar pertenencia
        const reservacion = await prisma.reservacion.findUnique({
            where: { id: parseInt(id) }
        });

        if (!reservacion || reservacion.usuarioId !== usuarioId) {
            return res.status(403).json({ message: 'Acceso denegado: No puedes cancelar esta reservación o no existe.' });
        }

        const reservaCancelada = await prisma.reservacion.update({
            where: { id: parseInt(id) },
            data: { estado: 'cancelada' }
        });

        return res.status(200).json({ message: 'Reservación cancelada con éxito', reservaCancelada });
    } catch (error) {
        return res.status(500).json({ message: 'Error al cancelar la reservación', error: error.message });
    }
};

module.exports = {
    crearReservacion,
    obtenerMisReservaciones,
    obtenerTodasReservaciones,
    cambiarEstadoReservacion,
    cancelarPropiaReservacion
};