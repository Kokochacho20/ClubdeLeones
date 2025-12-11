--Provincias
INSERT INTO provincias (nombre_provincia) VALUES ('San José');
INSERT INTO provincias (nombre_provincia) VALUES ('Alajuela');
INSERT INTO provincias (nombre_provincia) VALUES ('Cartago');
INSERT INTO provincias (nombre_provincia) VALUES ('Heredia');
INSERT INTO provincias (nombre_provincia) VALUES ('Guanacaste');
INSERT INTO provincias (nombre_provincia) VALUES ('Puntarenas');
INSERT INTO provincias (nombre_provincia) VALUES ('Limón');

--Cantones
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (1, 'Escazú');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (1, 'Desamparados');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (1, 'Goicoechea');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (2, 'Alajuela');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (2, 'San Ramón');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (2, 'Grecia');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (3, 'Cartago');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (3, 'Paraíso');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (3, 'La Unión');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (4, 'Heredia');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (4, 'Barva');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (4, 'Santo Domingo');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (5, 'Liberia');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (5, 'Nicoya');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (5, 'Santa Cruz');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (6, 'Puntarenas');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (6, 'Golfito');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (6, 'Buenos Aires');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (7, 'Limón');
INSERT INTO cantones (cod_provincia, nombre_canton) VALUES (7, 'Pococí');

--Distritos
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (1, 1, 'San Rafael');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (1, 1, 'San Antonio');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (1, 2, 'Patarrá');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (1, 2, 'San Miguel');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (1, 3, 'Guadalupe');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (1, 3, 'Ipís');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (2, 4, 'Carrizal');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (2, 4, 'San Antonio');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (2, 5, 'San Juan');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (2, 5, 'Piedades Norte');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (2, 6, 'San Roque');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (2, 6, 'Tacares');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (3, 7, 'San Nicolás');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (3, 7, 'Agua Caliente');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (3, 8, 'Orosi');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (3, 8, 'Cachí');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (3, 9, 'Tres Ríos');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (3, 9, 'Concepción');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (4, 10, 'Mercedes');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (4, 10, 'San Francisco');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (4, 11, 'San Pablo');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (4, 11, 'San José de la Montaña');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (4, 12, 'Santo Tomás');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (4, 12, 'Paracito');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (5, 13, 'Nacascolo');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (5, 13, 'Curubandé');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (5, 14, 'Mansión');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (5, 14, 'Sámara');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (5, 15, 'Veintisiete de Abril');
INSERT INTO distritos (cod_provincia, cod_canton, nombre_distrito) VALUES (5, 15, 'Cartagena');

--Tipo de Cambio
INSERT INTO tipo_cambio (fec_tip_cambio, tc_compra, tc_venta) VALUES (DATE '2025-01-01', 520.50, 525.75);
INSERT INTO tipo_cambio (fec_tip_cambio, tc_compra, tc_venta) VALUES (DATE '2025-01-02', 522.75, 526.75);
INSERT INTO tipo_cambio (fec_tip_cambio, tc_compra, tc_venta) VALUES (DATE '2025-01-03', 524.85, 524.75);
INSERT INTO tipo_cambio (fec_tip_cambio, tc_compra, tc_venta) VALUES (DATE '2025-01-04', 526.95, 528.75);
INSERT INTO tipo_cambio (fec_tip_cambio, tc_compra, tc_venta) VALUES (DATE '2025-01-05', 528.85, 530.75);

--Tipos de Actividad
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Cena benéfica', 'I');
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Cuota mensual', 'C');
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Compra de uniformes', 'G');
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Baile del Día de la Madre', 'I');
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Compra de chalecos', 'G');
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Cuota mensual', 'I');
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Pago Lions International', 'G');
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Primer Bingo 2026', 'I');
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Segundo Bingo 2026', 'I');
INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES ('Tercer Bingo 2026', 'I');

--Socios
-- ============================================
-- Script de Inserts de prueba para SOCIOS (10)
-- ============================================

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('Carlos Ramírez', DATE '1980-05-10', DATE '2020-01-15', 1, 1, 'San José centro, Barrio Amón', 88881234, 22223344, 'R', 'A');

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('María Fernández', DATE '1975-09-22', DATE '2018-03-10', 2, 2, 'Escazú, San Rafael', 88776655, NULL, 'R', 'A');

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('José Mora', DATE '1990-01-05', DATE '2021-07-01', 3, 3, 'Desamparados, Patarrá', 89994411, NULL, 'C', 'A');

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('Ana Solís', DATE '1988-11-12', DATE '2019-09-20', 4, 4, 'Goicoechea, Guadalupe', 88887777, 22334455, 'R', 'I');

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('Luis Gómez', DATE '1982-03-30', DATE '2017-05-14', 5, 5, 'Alajuela centro', 88112233, NULL, 'H', 'A');

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('Laura Vargas', DATE '1995-07-18', DATE '2022-02-01', 6, 6, 'San Ramón, San Juan', 87001122, NULL, 'R', 'A');

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('Diego Castro', DATE '1987-12-25', DATE '2016-11-11', 7, 7, 'Cartago centro', 89998877, 24556677, 'B', 'A');

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('Andrea Jiménez', DATE '1993-04-02', DATE '2020-06-30', 8, 8, 'Paraíso, Orosi', 88223344, NULL, 'R', 'A');

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('Ricardo Alfaro', DATE '1978-08-19', DATE '2015-08-01', 9, 9, 'La Unión, Tres Ríos', 89992211, 22221111, 'L', 'N');

INSERT INTO socios (nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio, cod_distrito, desc_direccion, telefono1, telefono2, tipo_socio, estado_socio)
VALUES ('Sofía Pérez', DATE '1999-10-10', DATE '2023-01-05', 10, 10, 'Heredia centro', 87776655, NULL, 'R', 'A');

-- Ingresos en colones y dólares
INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Cuota Mensual', 'M', 'I', 'C');

INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Donación Única', 'T', 'I', 'C');

INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Aporte Especial', 'D', 'I', 'D');

INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Bingo 1', 'T', 'I', 'D');

INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Rifa paquete convención', 'M', 'I', 'C');

-- Egresos en colones y dólares
INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Pago Servicios Públicos', 'M', 'E', 'C');

INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Compra carpetas', 'T', 'E', 'D');

INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Cuota Lions por ingreso', 'D', 'E', 'D');

INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Cuota anual Lions', 'T', 'E', 'D');

INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
VALUES ('Pago ingredientes para Bingo 1', 'D', 'E', 'C');


--Bancos
INSERT INTO BANCOS (nombre_banco, tel_banco1, tel_banco2, contacto_banco1, contacto_banco2)
VALUES ('Banco Nacional de Costa Rica', 22129000, 22129001, 'María López - Gerente Comercial', 'Carlos Jiménez - Atención Empresas');

INSERT INTO BANCOS (nombre_banco, tel_banco1, tel_banco2, contacto_banco1, contacto_banco2)
VALUES ('Banco de Costa Rica', 22871000, 22871001, 'Ana Rodríguez - Ejecutiva de Cuentas', 'Luis Fernández - Servicio al Cliente');

INSERT INTO BANCOS (nombre_banco, tel_banco1, tel_banco2, contacto_banco1, contacto_banco2)
VALUES ('BAC Credomatic', 22959000, 22959001, 'José Martínez - Gerente de Sucursales', 'Laura Castro - Atención Corporativa');

INSERT INTO BANCOS (nombre_banco, tel_banco1, tel_banco2, contacto_banco1, contacto_banco2)
VALUES ('Scotiabank Costa Rica', 22577000, 22577001, 'Pedro Vargas - Ejecutivo Senior', 'Gabriela Solís - Atención Personal');

INSERT INTO BANCOS (nombre_banco, tel_banco1, tel_banco2, contacto_banco1, contacto_banco2)
VALUES ('Davivienda Costa Rica', 22041000, 22041001, 'Andrea Morales - Gerente de Cuentas', 'Ricardo Pérez - Atención Empresarial');

--Cuentas bancarias
-- Banco Nacional (id_Banco = 1)
INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Corriente Club Leones Tibás', 1, 'C', DATE '2025-11-30', 250000.00);

INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Ahorros Eventos', 1, 'D', DATE '2025-11-30', 1500.00);

-- Banco de Costa Rica (id_Banco = 2)
INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Corriente Operaciones', 2, 'C', DATE '2025-11-30', 50000.00);

INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Ahorros Donaciones', 2, 'C', DATE '2025-11-30', 120000.00);

-- BAC Credomatic (id_Banco = 3)
INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Corriente Proyectos Sociales', 3, 'D', DATE '2025-11-30', 3000.00);

INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Ahorros Becas', 3, 'C', DATE '2025-11-30', 75000.00);

-- Scotiabank (id_Banco = 4)
INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Corriente Actividades Juveniles', 4, 'C', DATE '2025-11-30', 40000.00);

INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Ahorros Emergencias', 4, 'D', DATE '2025-11-30', 2500.00);

-- Davivienda (id_Banco = 5)
INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Corriente Eventos Especiales', 5, 'C', DATE '2025-11-30', 60000.00);

INSERT INTO CUENTAS_BANCARIAS (nombre_cuenta_bco, id_Banco, moneda_cuenta_bco, fec_corte, saldo_corte)
VALUES ('Cuenta Ahorros Internacional', 5, 'D', DATE '2025-11-30', 5000.00);

--Actividades
INSERT INTO ACTIVIDADES (nombre_actividad, id_tip_actividad, fecha_actividad, lugar_actividad, hora_actividad, id_tip_pago, descrip_actividad, costo_actividad, moneda_actividad, id_cuenta_bco)
VALUES ('Reunión Mensual de Junta Directiva', 1, DATE '2025-12-05', 'Sede Tibás', DATE '2025-12-05 18:00:00', 1, 'Revisión de proyectos y finanzas', 0.00, 'C', 1);

INSERT INTO ACTIVIDADES VALUES (DEFAULT, 'Campaña de Donación de Sangre', 3, DATE '2025-12-10', 'Hospital Calderón Guardia', DATE '2025-12-10 08:00:00', 2, 'Actividad social en coordinación con la CCSS', 50000.00, 'C', 2);

INSERT INTO ACTIVIDADES VALUES (DEFAULT, 'Cena Benéfica de Navidad', 2, DATE '2025-12-15', 'Hotel Radisson', DATE '2025-12-15 19:00:00', 3, 'Recaudación de fondos para becas', 150000.00, 'C', 3);

INSERT INTO ACTIVIDADES VALUES (DEFAULT, 'Rifa de Fin de Año', 2, DATE '2025-12-20', 'Sede Tibás', DATE '2025-12-20 17:00:00', 4, 'Venta de boletos para recaudar fondos', 20000.00, 'C', 1);

INSERT INTO ACTIVIDADES VALUES (DEFAULT, 'Entrega de Juguetes', 3, DATE '2025-12-24', 'Escuela Central Tibás', DATE '2025-12-24 09:00:00', 5, 'Campaña navideña para niños', 75000.00, 'C', 2);

INSERT INTO ACTIVIDADES VALUES (DEFAULT, 'Seminario de Liderazgo Juvenil', 2, DATE '2026-01-10', 'Universidad de Costa Rica', DATE '2026-01-10 14:00:00', 6, 'Capacitación para jóvenes líderes', 100000.00, 'D', 4);

INSERT INTO ACTIVIDADES VALUES (DEFAULT, 'Mantenimiento del edificio', 4, DATE '2026-01-15', 'Sede Tibás', DATE '2026-01-15 08:00:00', 7, 'Reparaciones y limpieza general', 30000.00, 'C', 5);

INSERT INTO ACTIVIDADES VALUES (DEFAULT, 'Cuota Mensual', 5, DATE '2026-02-01', 'Sede Tibás', DATE '2026-02-01 07:00:00', 8, 'Copta mensual por socio', 4500.00, 'D', 5);

INSERT INTO ACTIVIDADES VALUES (DEFAULT, 'Feria de Salud Comunitaria', 3, DATE '2026-02-15', 'Parque Central Tibás', DATE '2026-02-15 09:00:00', 9, 'Charlas y chequeos médicos gratuitos', 60000.00, 'C', 3);

INSERT INTO ACTIVIDADES VALUES (DEFAULT, 'Evento Cultural de Recaudación', 2, DATE '2026-03-01', 'Teatro Nacional', DATE '2026-03-01 18:00:00', 10, 'Presentaciones artísticas para recaudar fondos', 120000.00, 'C', 4);

--Actividades por socio
-- Socio 1
INSERT INTO ACTIV_SOCIO (id_actividad, id_socio, fec_comprom, estado, monto_Comprom, saldo_Comprom)
VALUES (1, 1, DATE '2025-12-01', 'R', 0.00, 0.00);

INSERT INTO ACTIV_SOCIO VALUES (DEFAULT, 2, 1, DATE '2025-12-01', 'R', 5000.00, 5000.00);

-- Socio 2
INSERT INTO ACTIV_SOCIO VALUES (DEFAULT, 3, 2, DATE '2025-12-05', 'R', 10000.00, 10000.00);
INSERT INTO ACTIV_SOCIO VALUES (DEFAULT, 4, 2, DATE '2025-12-05', 'R', 2000.00, 2000.00);

-- Socio 3
INSERT INTO ACTIV_SOCIO VALUES (DEFAULT, 5, 3, DATE '2025-12-10', 'R', 3000.00, 3000.00);
INSERT INTO ACTIV_SOCIO VALUES (DEFAULT, 6, 3, DATE '2025-12-10', 'R', 15000.00, 15000.00);

-- Socio 4
INSERT INTO ACTIV_SOCIO VALUES (DEFAULT, 7, 4, DATE '2026-01-01', 'R', 2000.00, 2000.00);
INSERT INTO ACTIV_SOCIO VALUES (DEFAULT, 8, 4, DATE '2026-01-01', 'R', 2500.00, 2500.00);

-- Socio 5
INSERT INTO ACTIV_SOCIO VALUES (DEFAULT, 9, 5, DATE '2026-01-15', 'R', 4000.00, 4000.00);
INSERT INTO ACTIV_SOCIO VALUES (DEFAULT, 10, 5, DATE '2026-01-15', 'R', 6000.00, 6000.00);

---- Transacciones en colones
INSERT INTO TRANSACCIONES (id_activ_soc, fec_transaccion, id_tip_pago, mes_pago, an_pago, moneda_transac, monto_colones, monto_dolares, id_tip_cambio)
VALUES (1, DATE '2025-12-05', 1, 12, 2025, 'C', 5000.00, NULL, 1);

INSERT INTO TRANSACCIONES VALUES (DEFAULT, 2, DATE '2025-12-10', 2, 12, 2025, 'C', 10000.00, NULL, 1);

INSERT INTO TRANSACCIONES VALUES (DEFAULT, 3, DATE '2025-12-15', 3, 12, 2025, 'C', 7500.00, NULL, 1);

INSERT INTO TRANSACCIONES VALUES (DEFAULT, 4, DATE '2025-12-20', 4, 12, 2025, 'C', 2000.00, NULL, 1);

INSERT INTO TRANSACCIONES VALUES (DEFAULT, 5, DATE '2025-12-25', 5, 12, 2025, 'C', 3000.00, NULL, 1);

-- Transacciones en dólares
INSERT INTO TRANSACCIONES VALUES (DEFAULT, 6, DATE '2026-01-05', 6, 1, 2026, 'D', 0.00, 100.00, 2);

INSERT INTO TRANSACCIONES VALUES (DEFAULT, 7, DATE '2026-01-10', 7, 1, 2026, 'D', 0.00, 250.00, 2);

INSERT INTO TRANSACCIONES VALUES (DEFAULT, 8, DATE '2026-01-15', 8, 1, 2026, 'D', 0.00, 150.00, 2);

INSERT INTO TRANSACCIONES VALUES (DEFAULT, 9, DATE '2026-01-20', 9, 1, 2026, 'D', 0.00, 200.00, 2);

INSERT INTO TRANSACCIONES VALUES (DEFAULT, 10, DATE '2026-01-25', 10, 1, 2026, 'D', 0.00, 300.00, 2);

--
-- Depósitos en colones
INSERT INTO TRANSAC_CTA (tipo_transac_cta, id_cuenta_bco_origen, id_cuenta_bco_destino, moneda_transac_cta, monto_colones, monto_dolares, id_tip_cambio, fec_transac_cta, conciliada)
VALUES ('D', 1, 2, 'C', 10000.00, NULL, 1, DATE '2025-12-05', 'S');

INSERT INTO TRANSAC_CTA VALUES (DEFAULT, 'D', 2, 3, 'C', 15000.00, NULL, 1, DATE '2025-12-10', 'N', NULL);

INSERT INTO TRANSAC_CTA VALUES (DEFAULT, 'D', 3, 4, 'C', 20000.00, NULL, 1, DATE '2025-12-15', 'S', DATE '2025-12-16');

-- Retiros en colones
INSERT INTO TRANSAC_CTA VALUES (DEFAULT, 'R', 4, 5, 'C', 5000.00, NULL, 1, DATE '2025-12-20', 'N', NULL);

INSERT INTO TRANSAC_CTA VALUES (DEFAULT, 'R', 5, 1, 'C', 8000.00, NULL, 1, DATE '2025-12-25', 'S', DATE '2025-12-26');

-- Transferencias en dólares
INSERT INTO TRANSAC_CTA VALUES (DEFAULT, 'T', 1, 3, 'D', 0.00, 250.00, 2, DATE '2026-01-05', 'N', NULL);

INSERT INTO TRANSAC_CTA VALUES (DEFAULT, 'T', 2, 4, 'D', 0.00, 300.00, 2, DATE '2026-01-10', 'S', DATE '2026-01-11');

INSERT INTO TRANSAC_CTA VALUES (DEFAULT, 'T', 3, 5, 'D', 0.00, 150.00, 2, DATE '2026-01-15', 'N', NULL);

-- Depósitos en dólares
INSERT INTO TRANSAC_CTA VALUES (DEFAULT, 'D', 4, 1, 'D', 0.00, 500.00, 2, DATE '2026-01-20', 'S', DATE '2026-01-21');

INSERT INTO TRANSAC_CTA VALUES (DEFAULT, 'D', 5, 2, 'D', 0.00, 600.00, 2, DATE '2026-01-25', 'N', NULL);

