--Procedimientos CRUD

--Insertar

CREATE OR REPLACE PROCEDURE insertar_provincia (
    p_nombre_provincia IN PROVINCIAS.nombre_provincia%TYPE
)
IS
BEGIN
    INSERT INTO PROVINCIAS (nombre_provincia)
    VALUES (p_nombre_provincia);
    
    COMMIT;
END insertar_provincia;
/

CREATE OR REPLACE PROCEDURE insertar_canton (
    p_cod_provincia IN CANTONES.cod_provincia%TYPE,
    p_nombre_canton IN CANTONES.nombre_canton%TYPE
)
IS
    P_EXISTE NUMBER := 0;
BEGIN
    -- Verifica que la provincia exista antes de insertar
    SELECT COUNT(*) INTO P_EXISTE
    FROM PROVINCIAS
    WHERE cod_provincia = p_cod_provincia;

    IF P_EXISTE = 1 THEN
        INSERT INTO CANTONES (cod_provincia, nombre_canton)
        VALUES (p_cod_provincia, p_nombre_canton);
        
        COMMIT;
    ELSE
        RAISE_APPLICATION_ERROR(-20001, 'La provincia especificada no existe.');
    END IF;
END insertar_canton;
/

CREATE OR REPLACE PROCEDURE insertar_distrito (
    p_cod_provincia   IN DISTRITOS.cod_provincia%TYPE,
    p_cod_canton      IN DISTRITOS.cod_canton%TYPE,
    p_nombre_distrito IN DISTRITOS.nombre_distrito%TYPE
)
IS
    v_provincia_existe NUMBER := 0;
    v_canton_existe    NUMBER := 0;
BEGIN
    -- Verificar existencia de la provincia
    SELECT COUNT(*) INTO v_provincia_existe
    FROM PROVINCIAS
    WHERE cod_provincia = p_cod_provincia;

    -- Verificar existencia del cantón
    SELECT COUNT(*) INTO v_canton_existe
    FROM CANTONES
    WHERE cod_canton = p_cod_canton
      AND cod_provincia = p_cod_provincia;

    IF v_provincia_existe = 1 AND v_canton_existe = 1 THEN
        INSERT INTO DISTRITOS (cod_provincia, cod_canton, nombre_distrito)
        VALUES (p_cod_provincia, p_cod_canton, p_nombre_distrito);

        COMMIT;
    ELSE
        RAISE_APPLICATION_ERROR(-20002, 'Provincia o cantón inválido, o no están relacionados correctamente.');
    END IF;
END insertar_distrito;
/

CREATE OR REPLACE PROCEDURE insertar_tipo_cambio (
    p_fec_tip_cambio IN TIPO_CAMBIO.fec_tip_cambio%TYPE,
    p_tc_compra      IN TIPO_CAMBIO.tc_compra%TYPE,
    p_tc_venta       IN TIPO_CAMBIO.tc_venta%TYPE
)
IS
BEGIN
    -- Validación básica: la fecha no puede ser nula y los valores deben ser positivos
    IF p_fec_tip_cambio IS NULL THEN
        RAISE_APPLICATION_ERROR(-20010, 'La fecha del tipo de cambio no puede ser nula.');
    ELSIF p_tc_compra <= 0 OR p_tc_venta <= 0 THEN
        RAISE_APPLICATION_ERROR(-20011, 'Los valores de compra y venta deben ser mayores que cero.');
    ELSE
        INSERT INTO TIPO_CAMBIO (fec_tip_cambio, tc_compra, tc_venta)
        VALUES (p_fec_tip_cambio, p_tc_compra, p_tc_venta);

        COMMIT;
    END IF;
END insertar_tipo_cambio;
/

CREATE OR REPLACE PROCEDURE insertar_tipo_actividad (
    p_nombre_tip_actividad IN TIPO_ACTIVIDAD.nombre_tip_actividad%TYPE,
    p_tipo_actividad       IN TIPO_ACTIVIDAD.tipo_actividad%TYPE DEFAULT 'C'
)
IS
BEGIN
    -- Validar que el tipo de actividad sea uno de los permitidos
    IF p_tipo_actividad NOT IN ('I', 'C', 'G') THEN
        RAISE_APPLICATION_ERROR(-20020, 'El tipo de actividad debe ser I, C o G.');
    END IF;

    INSERT INTO TIPO_ACTIVIDAD (nombre_tip_actividad, tipo_actividad)
    VALUES (p_nombre_tip_actividad, p_tipo_actividad);

    COMMIT;
END insertar_tipo_actividad;
/

CREATE OR REPLACE PROCEDURE insertar_socio (
    p_nombre_socio      IN SOCIOS.nombre_socio%TYPE,
    p_fecha_nacimiento  IN SOCIOS.fecha_nacimiento%TYPE,
    p_fecha_ingreso     IN SOCIOS.fecha_ingreso%TYPE,
    p_numero_socio      IN SOCIOS.número_socio%TYPE,
    p_cod_distrito      IN SOCIOS.cod_distrito%TYPE,
    p_desc_direccion    IN SOCIOS.desc_direccion%TYPE,
    p_telefono1         IN SOCIOS.telefono1%TYPE,
    p_telefono2         IN SOCIOS.telefono2%TYPE,
    p_tipo_socio        IN SOCIOS.tipo_socio%TYPE DEFAULT 'R',
    p_estado_socio      IN SOCIOS.estado_socio%TYPE DEFAULT 'A'
)
IS
    v_distrito_existe NUMBER := 1;
BEGIN
    -- Validar tipo_socio
    IF p_tipo_socio NOT IN ('R','C','H','B','L') THEN
        RAISE_APPLICATION_ERROR(-20030, 'Tipo de socio inválido. Debe ser R, C, H, B o L.');
    END IF;

    -- Validar estado_socio
    IF p_estado_socio NOT IN ('A','I','N') THEN
        RAISE_APPLICATION_ERROR(-20031, 'Estado de socio inválido. Debe ser A, I o N.');
    END IF;

    -- Validar existencia del distrito si se proporciona
    IF p_cod_distrito IS NOT NULL THEN
        SELECT COUNT(*) INTO v_distrito_existe
        FROM DISTRITOS
        WHERE cod_distrito = p_cod_distrito;

        IF v_distrito_existe = 0 THEN
            RAISE_APPLICATION_ERROR(-20032, 'El distrito especificado no existe.');
        END IF;
    END IF;

    -- Insertar el socio
    INSERT INTO SOCIOS (
        nombre_socio, fecha_nacimiento, fecha_ingreso, número_socio,
        cod_distrito, desc_direccion, telefono1, telefono2,
        tipo_socio, estado_socio
    )
    VALUES (
        p_nombre_socio, p_fecha_nacimiento, p_fecha_ingreso, p_numero_socio,
        p_cod_distrito, p_desc_direccion, p_telefono1, p_telefono2,
        p_tipo_socio, p_estado_socio
    );

    COMMIT;
END insertar_socio;
/

CREATE OR REPLACE PROCEDURE insertar_tipo_pago (
    p_nombre_tip_pago IN TIPO_PAGO.nombre_tip_pago%TYPE,
    p_periodicidad     IN TIPO_PAGO.periodicidad%TYPE DEFAULT 'M',
    p_tipo             IN TIPO_PAGO.tipo%TYPE DEFAULT 'I',
    p_moneda           IN TIPO_PAGO.moneda%TYPE DEFAULT 'C'
)
IS
BEGIN
    -- Validar periodicidad
    IF p_periodicidad NOT IN ('M', 'T', 'D') THEN
        RAISE_APPLICATION_ERROR(-20040, 'Periodicidad inválida. Debe ser M, T o D.');
    END IF;

    -- Validar tipo
    IF p_tipo NOT IN ('I', 'E') THEN
        RAISE_APPLICATION_ERROR(-20041, 'Tipo inválido. Debe ser I o E.');
    END IF;

    -- Validar moneda
    IF p_moneda NOT IN ('C', 'D') THEN
        RAISE_APPLICATION_ERROR(-20042, 'Moneda inválida. Debe ser C o D.');
    END IF;

    -- Insertar registro
    INSERT INTO TIPO_PAGO (nombre_tip_pago, periodicidad, tipo, moneda)
    VALUES (p_nombre_tip_pago, p_periodicidad, p_tipo, p_moneda);

    COMMIT;
END insertar_tipo_pago;
/

CREATE OR REPLACE PROCEDURE insertar_banco (
    p_nombre_banco     IN BANCOS.nombre_banco%TYPE,
    p_tel_banco1       IN BANCOS.tel_banco1%TYPE,
    p_tel_banco2       IN BANCOS.tel_banco2%TYPE,
    p_contacto_banco1  IN BANCOS.contacto_banco1%TYPE,
    p_contacto_banco2  IN BANCOS.contacto_banco2%TYPE
)
IS
BEGIN
    -- Validación básica de campos obligatorios
    IF p_nombre_banco IS NULL THEN
        RAISE_APPLICATION_ERROR(-20050, 'El nombre del banco no puede ser nulo.');
    ELSIF p_tel_banco1 IS NULL THEN
        RAISE_APPLICATION_ERROR(-20051, 'El teléfono principal del banco no puede ser nulo.');
    ELSIF p_contacto_banco1 IS NULL THEN
        RAISE_APPLICATION_ERROR(-20052, 'El contacto principal del banco no puede ser nulo.');
    END IF;

    -- Inserción del registro
    INSERT INTO BANCOS (
        nombre_banco, tel_banco1, tel_banco2,
        contacto_banco1, contacto_banco2
    )
    VALUES (
        p_nombre_banco, p_tel_banco1, p_tel_banco2,
        p_contacto_banco1, p_contacto_banco2
    );

    COMMIT;
END insertar_banco;
/

CREATE OR REPLACE PROCEDURE insertar_cuenta_bancaria (
    p_nombre_cuenta_bco  IN CUENTAS_BANCARIAS.nombre_cuenta_bco%TYPE,
    p_id_banco           IN CUENTAS_BANCARIAS.id_banco%TYPE,
    p_moneda_cuenta_bco  IN CUENTAS_BANCARIAS.moneda_cuenta_bco%TYPE DEFAULT 'C',
    p_fec_corte          IN CUENTAS_BANCARIAS.fec_corte%TYPE DEFAULT NULL,
    p_saldo_corte        IN CUENTAS_BANCARIAS.saldo_corte%TYPE DEFAULT NULL
)
IS
    v_banco_existe NUMBER := 0;
BEGIN
    -- Validar moneda
    IF p_moneda_cuenta_bco NOT IN ('C', 'D') THEN
        RAISE_APPLICATION_ERROR(-20060, 'Moneda inválida. Debe ser C o D.');
    END IF;

    -- Validar existencia del banco
    SELECT COUNT(*) INTO v_banco_existe
    FROM BANCOS
    WHERE id_banco = p_id_banco;

    IF v_banco_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20061, 'El banco especificado no existe.');
    END IF;

    -- Insertar cuenta bancaria
    INSERT INTO CUENTAS_BANCARIAS (
        nombre_cuenta_bco,
        id_banco,
        moneda_cuenta_bco,
        fec_corte,
        saldo_corte
    )
    VALUES (
        p_nombre_cuenta_bco,
        p_id_banco,
        p_moneda_cuenta_bco,
        p_fec_corte,
        p_saldo_corte
    );

    COMMIT;
END insertar_cuenta_bancaria;
/

CREATE OR REPLACE PROCEDURE insertar_actividad (
    p_nombre_actividad   IN ACTIVIDADES.nombre_actividad%TYPE,
    p_id_tip_actividad   IN ACTIVIDADES.id_tip_actividad%TYPE,
    p_fecha_actividad    IN ACTIVIDADES.fecha_actividad%TYPE,
    p_lugar_actividad    IN ACTIVIDADES.lugar_actividad%TYPE,
    p_hora_actividad     IN ACTIVIDADES.hora_actividad%TYPE,
    p_id_tip_pago        IN ACTIVIDADES.id_tip_pago%TYPE,
    p_descrip_actividad  IN ACTIVIDADES.descrip_actividad%TYPE DEFAULT NULL,
    p_costo_actividad    IN ACTIVIDADES.costo_actividad%TYPE,
    p_moneda_actividad   IN ACTIVIDADES.moneda_actividad%TYPE DEFAULT 'C',
    p_id_cuenta_bco      IN ACTIVIDADES.id_cuenta_bco%TYPE
)
IS
    v_tip_actividad_existe NUMBER := 0;
    v_tip_pago_existe      NUMBER := 0;
    v_cuenta_bco_existe    NUMBER := 0;
BEGIN
    -- Validar moneda
    IF p_moneda_actividad NOT IN ('C', 'D') THEN
        RAISE_APPLICATION_ERROR(-20070, 'Moneda inválida. Debe ser C o D.');
    END IF;

    -- Validar existencia de tipo de actividad
    SELECT COUNT(*) INTO v_tip_actividad_existe
    FROM TIPO_ACTIVIDAD
    WHERE id_tip_actividad = p_id_tip_actividad;

    IF v_tip_actividad_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20071, 'El tipo de actividad especificado no existe.');
    END IF;

    -- Validar existencia de tipo de pago
    SELECT COUNT(*) INTO v_tip_pago_existe
    FROM TIPO_PAGO
    WHERE id_tip_pago = p_id_tip_pago;

    IF v_tip_pago_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20072, 'El tipo de pago especificado no existe.');
    END IF;

    -- Validar existencia de cuenta bancaria
    SELECT COUNT(*) INTO v_cuenta_bco_existe
    FROM CUENTAS_BANCARIAS
    WHERE id_cuenta_bco = p_id_cuenta_bco;

    IF v_cuenta_bco_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20073, 'La cuenta bancaria especificada no existe.');
    END IF;

    -- Insertar actividad
    INSERT INTO ACTIVIDADES (
        nombre_actividad,
        id_tip_actividad,
        fecha_actividad,
        lugar_actividad,
        hora_actividad,
        id_tip_pago,
        descrip_actividad,
        costo_actividad,
        moneda_actividad,
        id_cuenta_bco
    )
    VALUES (
        p_nombre_actividad,
        p_id_tip_actividad,
        p_fecha_actividad,
        p_lugar_actividad,
        p_hora_actividad,
        p_id_tip_pago,
        p_descrip_actividad,
        p_costo_actividad,
        p_moneda_actividad,
        p_id_cuenta_bco
    );

    COMMIT;
END insertar_actividad;
/

CREATE OR REPLACE PROCEDURE insertar_activ_socio (
    p_id_actividad   IN ACTIV_SOCIO.id_actividad%TYPE,
    p_id_socio       IN ACTIV_SOCIO.id_socio%TYPE,
    p_fec_comprom    IN ACTIV_SOCIO.fec_comprom%TYPE DEFAULT NULL,
    p_estado         IN ACTIV_SOCIO.estado%TYPE DEFAULT 'R',
    p_fec_cancela    IN ACTIV_SOCIO.fec_cancela%TYPE DEFAULT NULL,
    p_monto_comprom  IN ACTIV_SOCIO.monto_comprom%TYPE,
    p_saldo_comprom  IN ACTIV_SOCIO.saldo_comprom%TYPE
)
IS
    v_actividad_existe NUMBER := 0;
    v_socio_existe     NUMBER := 0;
BEGIN
    -- Validar estado
    IF p_estado NOT IN ('R', 'C', 'P') THEN
        RAISE_APPLICATION_ERROR(-20080, 'Estado inválido. Debe ser R, C o P.');
    END IF;

    -- Validar existencia de actividad
    SELECT COUNT(*) INTO v_actividad_existe
    FROM ACTIVIDADES
    WHERE id_actividad = p_id_actividad;

    IF v_actividad_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20081, 'La actividad especificada no existe.');
    END IF;

    -- Validar existencia de socio
    SELECT COUNT(*) INTO v_socio_existe
    FROM SOCIOS
    WHERE id_socio = p_id_socio;

    IF v_socio_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20082, 'El socio especificado no existe.');
    END IF;

    -- Insertar registro en ACTIV_SOCIO
    INSERT INTO ACTIV_SOCIO (
        id_actividad,
        id_socio,
        fec_comprom,
        estado,
        fec_cancela,
        monto_comprom,
        saldo_comprom
    )
    VALUES (
        p_id_actividad,
        p_id_socio,
        p_fec_comprom,
        p_estado,
        p_fec_cancela,
        p_monto_comprom,
        p_saldo_comprom
    );

    COMMIT;
END insertar_activ_socio;
/

CREATE OR REPLACE PROCEDURE insertar_transaccion (
    p_id_activ_soc     IN TRANSACCIONES.id_activ_soc%TYPE,
    p_fec_transaccion  IN TRANSACCIONES.fec_transaccion%TYPE,
    p_id_tip_pago      IN TRANSACCIONES.id_tip_pago%TYPE,
    p_mes_pago         IN TRANSACCIONES.mes_pago%TYPE,
    p_an_pago          IN TRANSACCIONES.an_pago%TYPE,
    p_moneda_transac   IN TRANSACCIONES.moneda_transac%TYPE DEFAULT 'C',
    p_monto_colones    IN TRANSACCIONES.monto_colones%TYPE,
    p_monto_dolares    IN TRANSACCIONES.monto_dolares%TYPE DEFAULT NULL,
    p_id_tip_cambio    IN TRANSACCIONES.id_tip_cambio%TYPE
)
IS
    v_activ_soc_existe   NUMBER := 0;
    v_tip_pago_existe    NUMBER := 0;
    v_tip_cambio_existe  NUMBER := 0;
BEGIN
    -- Validar moneda
    IF p_moneda_transac NOT IN ('C', 'D') THEN
        RAISE_APPLICATION_ERROR(-20100, 'Moneda inválida. Debe ser C o D.');
    END IF;

    -- Validar existencia de relación actividad-socio
    SELECT COUNT(*) INTO v_activ_soc_existe
    FROM ACTIV_SOCIO
    WHERE id_activ_soc = p_id_activ_soc;

    IF v_activ_soc_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20101, 'La relación actividad-socio especificada no existe.');
    END IF;

    -- Validar existencia de tipo de pago
    SELECT COUNT(*) INTO v_tip_pago_existe
    FROM TIPO_PAGO
    WHERE id_tip_pago = p_id_tip_pago;

    IF v_tip_pago_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20102, 'El tipo de pago especificado no existe.');
    END IF;

    -- Validar existencia de tipo de cambio
    SELECT COUNT(*) INTO v_tip_cambio_existe
    FROM TIPO_CAMBIO
    WHERE id_tip_cambio = p_id_tip_cambio;

    IF v_tip_cambio_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20103, 'El tipo de cambio especificado no existe.');
    END IF;

    -- Insertar transacción
    INSERT INTO TRANSACCIONES (
        id_activ_soc,
        fec_transaccion,
        id_tip_pago,
        mes_pago,
        an_pago,
        moneda_transac,
        monto_colones,
        monto_dolares,
        id_tip_cambio
    )
    VALUES (
        p_id_activ_soc,
        p_fec_transaccion,
        p_id_tip_pago,
        p_mes_pago,
        p_an_pago,
        p_moneda_transac,
        p_monto_colones,
        p_monto_dolares,
        p_id_tip_cambio
    );

    COMMIT;
END insertar_transaccion;
/

CREATE OR REPLACE PROCEDURE insertar_transac_cta (
    p_tipo_transac_cta      IN TRANSAC_CTA.tipo_transac_cta%TYPE DEFAULT 'D',
    p_id_cuenta_bco_origen  IN TRANSAC_CTA.id_cuenta_bco_origen%TYPE,
    p_id_cuenta_bco_destino IN TRANSAC_CTA.id_cuenta_bco_destino%TYPE,
    p_moneda_transac_cta    IN TRANSAC_CTA.moneda_transac_cta%TYPE DEFAULT 'C',
    p_monto_colones         IN TRANSAC_CTA.monto_colones%TYPE,
    p_monto_dolares         IN TRANSAC_CTA.monto_dolares%TYPE DEFAULT NULL,
    p_id_tip_cambio         IN TRANSAC_CTA.id_tip_cambio%TYPE,
    p_fec_transac_cta       IN TRANSAC_CTA.fec_transac_cta%TYPE,
    p_conciliada            IN TRANSAC_CTA.conciliada%TYPE DEFAULT 'N',
    p_fec_concilia          IN TRANSAC_CTA.fec_concilia%TYPE DEFAULT NULL
)
IS
    v_cta_origen_existe   NUMBER := 0;
    v_cta_destino_existe  NUMBER := 0;
    v_tip_cambio_existe   NUMBER := 0;
BEGIN
    -- Validar tipo de transacción
    IF p_tipo_transac_cta NOT IN ('D', 'R', 'T') THEN
        RAISE_APPLICATION_ERROR(-20110, 'Tipo de transacción inválido. Debe ser D, R o T.');
    END IF;

    -- Validar moneda
    IF p_moneda_transac_cta NOT IN ('C', 'D') THEN
        RAISE_APPLICATION_ERROR(-20111, 'Moneda inválida. Debe ser C o D.');
    END IF;

    -- Validar estado de conciliación
    IF p_conciliada NOT IN ('S', 'N') THEN
        RAISE_APPLICATION_ERROR(-20112, 'Estado de conciliación inválido. Debe ser S o N.');
    END IF;

    -- Validar existencia de cuenta origen
    SELECT COUNT(*) INTO v_cta_origen_existe
    FROM CUENTAS_BANCARIAS
    WHERE id_cuenta_bco = p_id_cuenta_bco_origen;

    IF v_cta_origen_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20113, 'La cuenta bancaria de origen no existe.');
    END IF;

    -- Validar existencia de cuenta destino
    SELECT COUNT(*) INTO v_cta_destino_existe
    FROM CUENTAS_BANCARIAS
    WHERE id_cuenta_bco = p_id_cuenta_bco_destino;

    IF v_cta_destino_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20114, 'La cuenta bancaria de destino no existe.');
    END IF;

    -- Validar existencia de tipo de cambio
    SELECT COUNT(*) INTO v_tip_cambio_existe
    FROM TIPO_CAMBIO
    WHERE id_tip_cambio = p_id_tip_cambio;

    IF v_tip_cambio_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20115, 'El tipo de cambio especificado no existe.');
    END IF;

    -- Insertar transacción entre cuentas
    INSERT INTO TRANSAC_CTA (
        tipo_transac_cta,
        id_cuenta_bco_origen,
        id_cuenta_bco_destino,
        moneda_transac_cta,
        monto_colones,
        monto_dolares,
        id_tip_cambio,
        fec_transac_cta,
        conciliada,
        fec_concilia
    )
    VALUES (
        p_tipo_transac_cta,
        p_id_cuenta_bco_origen,
        p_id_cuenta_bco_destino,
        p_moneda_transac_cta,
        p_monto_colones,
        p_monto_dolares,
        p_id_tip_cambio,
        p_fec_transac_cta,
        p_conciliada,
        p_fec_concilia
    );

    COMMIT;
END insertar_transac_cta;
/

--Modificar
CREATE OR REPLACE PROCEDURE actualizar_provincia (
    p_cod_provincia     IN PROVINCIAS.cod_provincia%TYPE,
    p_nombre_provincia  IN PROVINCIAS.nombre_provincia%TYPE
)
IS
BEGIN
    UPDATE PROVINCIAS
    SET nombre_provincia = p_nombre_provincia
    WHERE cod_provincia = p_cod_provincia;

    COMMIT;
END actualizar_provincia;
/

CREATE OR REPLACE PROCEDURE actualizar_canton (
    p_cod_canton      IN CANTONES.cod_canton%TYPE,
    p_cod_provincia   IN CANTONES.cod_provincia%TYPE,
    p_nombre_canton   IN CANTONES.nombre_canton%TYPE
)
IS
BEGIN
    UPDATE CANTONES
    SET cod_provincia = p_cod_provincia,
        nombre_canton = p_nombre_canton
    WHERE cod_canton = p_cod_canton;

    COMMIT;
END actualizar_canton;
/

CREATE OR REPLACE PROCEDURE actualizar_distrito (
    p_cod_distrito     IN DISTRITOS.cod_distrito%TYPE,
    p_cod_provincia    IN DISTRITOS.cod_provincia%TYPE,
    p_cod_canton       IN DISTRITOS.cod_canton%TYPE,
    p_nombre_distrito  IN DISTRITOS.nombre_distrito%TYPE
)
IS
BEGIN
    UPDATE DISTRITOS
    SET cod_provincia = p_cod_provincia,
        cod_canton = p_cod_canton,
        nombre_distrito = p_nombre_distrito
    WHERE cod_distrito = p_cod_distrito;

    COMMIT;
END actualizar_distrito;
/

CREATE OR REPLACE PROCEDURE actualizar_tipo_cambio (
    p_id_tip_cambio  IN TIPO_CAMBIO.id_tip_cambio%TYPE,
    p_fec_tip_cambio IN TIPO_CAMBIO.fec_tip_cambio%TYPE,
    p_tc_compra      IN TIPO_CAMBIO.tc_compra%TYPE,
    p_tc_venta       IN TIPO_CAMBIO.tc_venta%TYPE
)
IS
BEGIN
    UPDATE TIPO_CAMBIO
    SET fec_tip_cambio = p_fec_tip_cambio,
        tc_compra = p_tc_compra,
        tc_venta = p_tc_venta
    WHERE id_tip_cambio = p_id_tip_cambio;

    COMMIT;
END actualizar_tipo_cambio;
/

CREATE OR REPLACE PROCEDURE actualizar_tipo_actividad (
    p_id_tip_actividad      IN TIPO_ACTIVIDAD.id_tip_actividad%TYPE,
    p_nombre_tip_actividad  IN TIPO_ACTIVIDAD.nombre_tip_actividad%TYPE,
    p_tipo_actividad        IN TIPO_ACTIVIDAD.tipo_actividad%TYPE
)
IS
BEGIN
    UPDATE TIPO_ACTIVIDAD
    SET nombre_tip_actividad = p_nombre_tip_actividad,
        tipo_actividad = p_tipo_actividad
    WHERE id_tip_actividad = p_id_tip_actividad;

    COMMIT;
END actualizar_tipo_actividad;
/

CREATE OR REPLACE PROCEDURE actualizar_socio (
    p_id_socio         IN SOCIOS.id_socio%TYPE,
    p_nombre_socio     IN SOCIOS.nombre_socio%TYPE,
    p_fecha_nacimiento IN SOCIOS.fecha_nacimiento%TYPE,
    p_fecha_ingreso    IN SOCIOS.fecha_ingreso%TYPE,
    p_numero_socio     IN SOCIOS.número_socio%TYPE,
    p_cod_distrito     IN SOCIOS.cod_distrito%TYPE,
    p_desc_direccion   IN SOCIOS.desc_direccion%TYPE,
    p_telefono1        IN SOCIOS.telefono1%TYPE,
    p_telefono2        IN SOCIOS.telefono2%TYPE,
    p_tipo_socio       IN SOCIOS.tipo_socio%TYPE,
    p_estado_socio     IN SOCIOS.estado_socio%TYPE
)
IS
BEGIN
    UPDATE SOCIOS
    SET nombre_socio = p_nombre_socio,
        fecha_nacimiento = p_fecha_nacimiento,
        fecha_ingreso = p_fecha_ingreso,
        número_socio = p_numero_socio,
        cod_distrito = p_cod_distrito,
        desc_direccion = p_desc_direccion,
        telefono1 = p_telefono1,
        telefono2 = p_telefono2,
        tipo_socio = p_tipo_socio,
        estado_socio = p_estado_socio
    WHERE id_socio = p_id_socio;

    COMMIT;
END actualizar_socio;
/

CREATE OR REPLACE PROCEDURE actualizar_tipo_pago (
    p_id_tip_pago     IN TIPO_PAGO.id_tip_pago%TYPE,
    p_nombre_tip_pago IN TIPO_PAGO.nombre_tip_pago%TYPE,
    p_periodicidad    IN TIPO_PAGO.periodicidad%TYPE,
    p_tipo            IN TIPO_PAGO.tipo%TYPE,
    p_moneda          IN TIPO_PAGO.moneda%TYPE
)
IS
BEGIN
    UPDATE TIPO_PAGO
    SET nombre_tip_pago = p_nombre_tip_pago,
        periodicidad = p_periodicidad,
        tipo = p_tipo,
        moneda = p_moneda
    WHERE id_tip_pago = p_id_tip_pago;

    COMMIT;
END actualizar_tipo_pago;
/

CREATE OR REPLACE PROCEDURE actualizar_banco (
    p_id_banco         IN BANCOS.id_banco%TYPE,
    p_nombre_banco     IN BANCOS.nombre_banco%TYPE,
    p_tel_banco1       IN BANCOS.tel_banco1%TYPE,
    p_tel_banco2       IN BANCOS.tel_banco2%TYPE,
    p_contacto_banco1  IN BANCOS.contacto_banco1%TYPE,
    p_contacto_banco2  IN BANCOS.contacto_banco2%TYPE
)
IS
BEGIN
    UPDATE BANCOS
    SET nombre_banco = p_nombre_banco,
        tel_banco1 = p_tel_banco1,
        tel_banco2 = p_tel_banco2,
        contacto_banco1 = p_contacto_banco1,
        contacto_banco2 = p_contacto_banco2
    WHERE id_banco = p_id_banco;

    COMMIT;
END actualizar_banco;
/

CREATE OR REPLACE PROCEDURE actualizar_cuenta_bancaria (
    p_id_cuenta_bco      IN CUENTAS_BANCARIAS.id_cuenta_bco%TYPE,
    p_nombre_cuenta_bco  IN CUENTAS_BANCARIAS.nombre_cuenta_bco%TYPE,
    p_id_banco           IN CUENTAS_BANCARIAS.id_banco%TYPE,
    p_moneda_cuenta_bco  IN CUENTAS_BANCARIAS.moneda_cuenta_bco%TYPE,
    p_fec_corte          IN CUENTAS_BANCARIAS.fec_corte%TYPE,
    p_saldo_corte        IN CUENTAS_BANCARIAS.saldo_corte%TYPE
)
IS
BEGIN
    UPDATE CUENTAS_BANCARIAS
    SET nombre_cuenta_bco = p_nombre_cuenta_bco,
        id_banco = p_id_banco,
        moneda_cuenta_bco = p_moneda_cuenta_bco,
        fec_corte = p_fec_corte,
        saldo_corte = p_saldo_corte
    WHERE id_cuenta_bco = p_id_cuenta_bco;

    COMMIT;
END actualizar_cuenta_bancaria;
/

CREATE OR REPLACE PROCEDURE actualizar_actividad (
    p_id_actividad       IN ACTIVIDADES.id_actividad%TYPE,
    p_nombre_actividad   IN ACTIVIDADES.nombre_actividad%TYPE,
    p_id_tip_actividad   IN ACTIVIDADES.id_tip_actividad%TYPE,
    p_fecha_actividad    IN ACTIVIDADES.fecha_actividad%TYPE,
    p_lugar_actividad    IN ACTIVIDADES.lugar_actividad%TYPE,
    p_hora_actividad     IN ACTIVIDADES.hora_actividad%TYPE,
    p_id_tip_pago        IN ACTIVIDADES.id_tip_pago%TYPE,
    p_descrip_actividad  IN ACTIVIDADES.descrip_actividad%TYPE,
    p_costo_actividad    IN ACTIVIDADES.costo_actividad%TYPE,
    p_moneda_actividad   IN ACTIVIDADES.moneda_actividad%TYPE,
    p_id_cuenta_bco      IN ACTIVIDADES.id_cuenta_bco%TYPE
)
IS
BEGIN
    UPDATE ACTIVIDADES
    SET nombre_actividad = p_nombre_actividad,
        id_tip_actividad = p_id_tip_actividad,
        fecha_actividad = p_fecha_actividad,
        lugar_actividad = p_lugar_actividad,
        hora_actividad = p_hora_actividad,
        id_tip_pago = p_id_tip_pago,
        descrip_actividad = p_descrip_actividad,
        costo_actividad = p_costo_actividad,
        moneda_actividad = p_moneda_actividad,
        id_cuenta_bco = p_id_cuenta_bco
    WHERE id_actividad = p_id_actividad;

    COMMIT;
END actualizar_actividad;
/

CREATE OR REPLACE PROCEDURE actualizar_activ_socio (
    p_id_activ_soc     IN ACTIV_SOCIO.id_activ_soc%TYPE,
    p_id_actividad     IN ACTIV_SOCIO.id_actividad%TYPE,
    p_id_socio         IN ACTIV_SOCIO.id_socio%TYPE,
    p_fec_comprom      IN ACTIV_SOCIO.fec_comprom%TYPE,
    p_estado           IN ACTIV_SOCIO.estado%TYPE,
    p_fec_cancela      IN ACTIV_SOCIO.fec_cancela%TYPE,
    p_monto_comprom    IN ACTIV_SOCIO.monto_comprom%TYPE,
    p_saldo_comprom    IN ACTIV_SOCIO.saldo_comprom%TYPE
)
IS
BEGIN
    UPDATE ACTIV_SOCIO
    SET id_actividad = p_id_actividad,
        id_socio = p_id_socio,
        fec_comprom = p_fec_comprom,
        estado = p_estado,
        fec_cancela = p_fec_cancela,
        monto_comprom = p_monto_comprom,
        saldo_comprom = p_saldo_comprom
    WHERE id_activ_soc = p_id_activ_soc;

    COMMIT;
END actualizar_activ_socio;
/

CREATE OR REPLACE PROCEDURE actualizar_transaccion (
    p_id_transaccion    IN TRANSACCIONES.id_transaccion%TYPE,
    p_id_activ_soc      IN TRANSACCIONES.id_activ_soc%TYPE,
    p_fec_transaccion   IN TRANSACCIONES.fec_transaccion%TYPE,
    p_id_tip_pago       IN TRANSACCIONES.id_tip_pago%TYPE,
    p_mes_pago          IN TRANSACCIONES.mes_pago%TYPE,
    p_an_pago           IN TRANSACCIONES.an_pago%TYPE,
    p_moneda_transac    IN TRANSACCIONES.moneda_transac%TYPE,
    p_monto_colones     IN TRANSACCIONES.monto_colones%TYPE,
    p_monto_dolares     IN TRANSACCIONES.monto_dolares%TYPE,
    p_id_tip_cambio     IN TRANSACCIONES.id_tip_cambio%TYPE
)
IS
BEGIN
    UPDATE TRANSACCIONES
    SET id_activ_soc = p_id_activ_soc,
        fec_transaccion = p_fec_transaccion,
        id_tip_pago = p_id_tip_pago,
        mes_pago = p_mes_pago,
        an_pago = p_an_pago,
        moneda_transac = p_moneda_transac,
        monto_colones = p_monto_colones,
        monto_dolares = p_monto_dolares,
        id_tip_cambio = p_id_tip_cambio
    WHERE id_transaccion = p_id_transaccion;

    COMMIT;
END actualizar_transaccion;
/

CREATE OR REPLACE PROCEDURE actualizar_transac_cta (
    p_id_transac_cta       IN TRANSAC_CTA.id_transac_cta%TYPE,
    p_tipo_transac_cta     IN TRANSAC_CTA.tipo_transac_cta%TYPE,
    p_id_cuenta_bco_origen IN TRANSAC_CTA.id_cuenta_bco_origen%TYPE,
    p_id_cuenta_bco_destino IN TRANSAC_CTA.id_cuenta_bco_destino%TYPE,
    p_moneda_transac_cta   IN TRANSAC_CTA.moneda_transac_cta%TYPE,
    p_monto_colones        IN TRANSAC_CTA.monto_colones%TYPE,
    p_monto_dolares        IN TRANSAC_CTA.monto_dolares%TYPE,
    p_id_tip_cambio        IN TRANSAC_CTA.id_tip_cambio%TYPE,
    p_fec_transac_cta      IN TRANSAC_CTA.fec_transac_cta%TYPE,
    p_conciliada           IN TRANSAC_CTA.conciliada%TYPE,
    p_fec_concilia         IN TRANSAC_CTA.fec_concilia%TYPE
)
IS
BEGIN
    UPDATE TRANSAC_CTA
    SET tipo_transac_cta = p_tipo_transac_cta,
        id_cuenta_bco_origen = p_id_cuenta_bco_origen,
        id_cuenta_bco_destino = p_id_cuenta_bco_destino,
        moneda_transac_cta = p_moneda_transac_cta,
        monto_colones = p_monto_colones,
        monto_dolares = p_monto_dolares,
        id_tip_cambio = p_id_tip_cambio,
        fec_transac_cta = p_fec_transac_cta,
        conciliada = p_conciliada,
        fec_concilia = p_fec_concilia
    WHERE id_transac_cta = p_id_transac_cta;

    COMMIT;
END actualizar_transac_cta;
/

--Eliminar
CREATE OR REPLACE PROCEDURE eliminar_provincia (
    p_cod_provincia IN PROVINCIAS.cod_provincia%TYPE
)
IS
BEGIN
    DELETE FROM PROVINCIAS
    WHERE cod_provincia = p_cod_provincia;

    COMMIT;
END eliminar_provincia;
/

CREATE OR REPLACE PROCEDURE eliminar_canton (
    p_cod_canton IN CANTONES.cod_canton%TYPE
)
IS
BEGIN
    DELETE FROM CANTONES
    WHERE cod_canton = p_cod_canton;

    COMMIT;
END eliminar_canton;
/

CREATE OR REPLACE PROCEDURE eliminar_distrito (
    p_cod_distrito IN DISTRITOS.cod_distrito%TYPE
)
IS
BEGIN
    DELETE FROM DISTRITOS
    WHERE cod_distrito = p_cod_distrito;

    COMMIT;
END eliminar_distrito;
/

CREATE OR REPLACE PROCEDURE eliminar_tipo_cambio (
    p_id_tip_cambio IN TIPO_CAMBIO.id_tip_cambio%TYPE
)
IS
BEGIN
    DELETE FROM TIPO_CAMBIO
    WHERE id_tip_cambio = p_id_tip_cambio;

    COMMIT;
END eliminar_tipo_cambio;
/

CREATE OR REPLACE PROCEDURE eliminar_tipo_actividad (
    p_id_tip_actividad IN TIPO_ACTIVIDAD.id_tip_actividad%TYPE
)
IS
BEGIN
    DELETE FROM TIPO_ACTIVIDAD
    WHERE id_tip_actividad = p_id_tip_actividad;

    COMMIT;
END eliminar_tipo_actividad;
/

CREATE OR REPLACE PROCEDURE eliminar_socio (
    p_id_socio IN SOCIOS.id_socio%TYPE
)
IS
BEGIN
    DELETE FROM SOCIOS
    WHERE id_socio = p_id_socio;

    COMMIT;
END eliminar_socio;
/

CREATE OR REPLACE PROCEDURE eliminar_banco (
    p_id_banco IN BANCOS.id_banco%TYPE
)
IS
BEGIN
    DELETE FROM BANCOS
    WHERE id_banco = p_id_banco;

    COMMIT;
END eliminar_banco;
/

CREATE OR REPLACE PROCEDURE eliminar_cuenta_bancaria (
    p_id_cuenta_bco IN CUENTAS_BANCARIAS.id_cuenta_bco%TYPE
)
IS
BEGIN
    DELETE FROM CUENTAS_BANCARIAS
    WHERE id_cuenta_bco = p_id_cuenta_bco;

    COMMIT;
END eliminar_cuenta_bancaria;
/

CREATE OR REPLACE PROCEDURE eliminar_actividad (
    p_id_actividad IN ACTIVIDADES.id_actividad%TYPE
)
IS
BEGIN
    DELETE FROM ACTIVIDADES
    WHERE id_actividad = p_id_actividad;

    COMMIT;
END eliminar_actividad;
/

CREATE OR REPLACE PROCEDURE eliminar_activ_socio (
    p_id_activ_soc IN ACTIV_SOCIO.id_activ_soc%TYPE
)
IS
BEGIN
    DELETE FROM ACTIV_SOCIO
    WHERE id_activ_soc = p_id_activ_soc;

    COMMIT;
END eliminar_activ_socio;
/

CREATE OR REPLACE PROCEDURE eliminar_transaccion (
    p_id_transaccion IN TRANSACCIONES.id_transaccion%TYPE
)
IS
BEGIN
    DELETE FROM TRANSACCIONES
    WHERE id_transaccion = p_id_transaccion;

    COMMIT;
END eliminar_transaccion;
/

CREATE OR REPLACE PROCEDURE eliminar_transac_cta (
    p_id_transac_cta IN TRANSAC_CTA.id_transac_cta%TYPE
)
IS
BEGIN
    DELETE FROM TRANSAC_CTA
    WHERE id_transac_cta = p_id_transac_cta;

    COMMIT;
END eliminar_transac_cta;
/



