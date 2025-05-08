-- Venues table ("Espacios")
CREATE TABLE venue (
    venue_id SERIAL PRIMARY KEY,          -- "id_espacio"
    name_venue VARCHAR(100) NOT NULL,     -- "nombre"
    capacity INTEGER NOT NULL,            -- "capacidad"
    description TEXT                      -- "descripcion"
);

-- Users table ("Usuarios")
CREATE TABLE user_table (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL CHECK (user_role IN ('Administrador', 'Jefe de departamento'))
);

-- Reservations table ("Reservas")
CREATE TABLE reservation (
    folio VARCHAR(20) PRIMARY KEY,
	requester_name VARCHAR(50) NOT NULL,
    venue_id INTEGER NOT NULL REFERENCES venue(venue_id),    -- "id_espacio"
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,                                  -- "duración"
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada')), -- Cancelar es un borrado logico
    description TEXT,           -- "descripcion"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- "fecha de creacion"
    CHECK (end_time > start_time)
);

-- Change history table ("HistorialCambios")
CREATE TABLE change_history (
    change_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_table(user_id),
    action_changed TEXT NOT NULL,                                          -- "cambio realizado"
    reservation_folio VARCHAR(20) NOT NULL REFERENCES reservation(folio),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP                        --"fecha_accion"
);


-- SEEDERS: Espacios definidos ('venue')
INSERT INTO venue (name_venue, capacity, description) VALUES  -- Usando name_venue
('Sala de reuniones pequeña', 10, 'Oficina audiovisual del tercer piso'),
('Sala de reuniones grande', 20, 'Sala audiovisual del segundo piso'),
('Auditorio', 80, 'Salón del exterior equipado con proyector, audio y equipo de cómputo'),
('Área de descanso', 40, 'Sala del primer piso, con comedor y pantallas');

-- SEEDERS: Administradores y usuarios
INSERT INTO user_table (username, password_hash, user_role) VALUES  -- Cambiado a user_table
('Daniha Uribe', '3214', 'Administrador'),
('Admin', 'admin', 'Administrador'),
('Sofia Armenta', '111', 'Jefe de departamento'),
('Fausto Gonzales', '222', 'Jefe de departamento'),
('Marco Fernadez', '333', 'Jefe de departamento'),
('Erika Martinez', '444', 'Jefe de departamento');

-- SEEDERS: Reservas
INSERT INTO reservation (folio, requester_name, venue_id, reservation_date, start_time, end_time, status, description) VALUES
('00001', 'Daniha Uribe', 2, '2025-04-01', '09:00:00', '09:30:00', 'Aprobada', 'Reunión Mensual de planeación'),
('00002', 'Admin', 1, '2025-04-02', '09:30:00', '10:00:00', 'Aprobada', 'Reunión Semanal de revisión de avances'),
('00003', 'Sofia Armenta', 3, '2025-04-03', '13:00:00', '14:00:00', 'Pendiente', 'Evento anual empresarial'),
('00004', 'Fausto Gonzales', 4, '2025-04-04', '15:00:00', '16:00:00', 'Rechazada', 'Celebración de cumpleaños');

-- SEEDERS: Historial de cambios
INSERT INTO change_history (user_id, action_changed, reservation_folio) VALUES
(1, 'Reserva aprobada', '00001'),
(1, 'Modificada: cambio de hora de 09:00:00 a 09:30:00', '00002'),
(1, 'Reserva aprobada', '00002'),
(2, 'Reserva rechazada: conflicto de horario', '00004');

-- [Tipo de acción]: [Detalle] 'Motivo opcional'  
-- 1. APROBACIÓN/RECHAZO
-- Reserva aprobada
-- Reserva rechazada: conflicto de horario  -- (único motivo mencionado)

-- 2. MODIFICACIONES
-- Modificada: cambio de fecha de [old] a [new]        -- Acción de modificación
-- Modificada: cambio de espacio de [old] a [new]      -- cambiar el espacio
-- Modificada: cambio de hora de [old] a [new]         -- cambiar la hora
-- Modificada: actualización de descripción            -- modificar sus detalles

-- 3. CANCELACIÓN (solo para admins)
--'Reserva cancelada por administrador'                -- DELETE: Cancelar una reserva


SELECT 
    reservation.*, 
    venue.venue_name
FROM reservation
INNER JOIN venue ON reservation.venue_id = venue.venue_id
WHERE reservation.folio = '00001';





