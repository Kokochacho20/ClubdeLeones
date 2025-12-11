--Al menos seis de las tablas deben incluir disparadores (triggers). Específicamente dos para cada acción.
--Los trigger se harán en las siguientes tablas: SOCIOS, ACTIVIDADES, ACTIV_SOCIO, 
--TRANSACCIONES, CUENTAS_BANCARIAS y BANCOS

--1.Tabla SOCIOS
-- Trigger BEFORE INSERT: valida teléfono
CREATE OR REPLACE TRIGGER trg_socios_bi
BEFORE INSERT ON SOCIOS
FOR EACH ROW
BEGIN
    IF NOT REGEXP_LIKE(:NEW.telefono1, '^[0-9]{8}$') THEN
        RAISE_APPLICATION_ERROR(-21001, 'Teléfono principal inválido (8 dígitos).');
    END IF;
END;
/

-- Trigger AFTER INSERT: mensaje de inserción
CREATE OR REPLACE TRIGGER trg_socios_ai
AFTER INSERT ON SOCIOS
FOR EACH ROW
BEGIN
    DBMS_OUTPUT.PUT_LINE('Se insertó socio: ' || :NEW.nombre_socio);
END;
/

--2.Tabla ACTIVIDADES
-- BEFORE UPDATE: valida que fecha no sea pasada
CREATE OR REPLACE TRIGGER trg_actividades_bu
BEFORE UPDATE ON ACTIVIDADES
FOR EACH ROW
BEGIN
    IF :NEW.fecha_actividad < SYSDATE THEN
        RAISE_APPLICATION_ERROR(-21002, 'La fecha de actividad no puede ser anterior a hoy.');
    END IF;
END;
/

-- AFTER UPDATE:  mensaje de actualización
CREATE OR REPLACE TRIGGER trg_actividades_au
AFTER UPDATE ON ACTIVIDADES
FOR EACH ROW
BEGIN
    DBMS_OUTPUT.PUT_LINE('Actividad ' || :OLD.id_actividad || ' fue actualizada.');
END;
/

--3.ACTIV_SOCIO 
-- BEFORE DELETE: valida que no tenga transacciones asociadas
CREATE OR REPLACE TRIGGER trg_activsocio_bd
BEFORE DELETE ON ACTIV_SOCIO
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM TRANSACCIONES
    WHERE id_activ_soc = :OLD.id_activ_soc;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-21003, 'No se puede eliminar: tiene transacciones asociadas.');
    END IF;
END;
/

-- AFTER DELETE:  mensaje al eliminar
CREATE OR REPLACE TRIGGER trg_activsocio_ad
AFTER DELETE ON ACTIV_SOCIO
FOR EACH ROW
BEGIN
    DBMS_OUTPUT.PUT_LINE('Se eliminó relación actividad-socio: ' || :OLD.id_activ_soc);
END;
/

--4.TRANSACCIONES
--BEFORE INSERT: valida el monto
CREATE OR REPLACE TRIGGER trg_transacciones_bi
BEFORE INSERT ON TRANSACCIONES
FOR EACH ROW
BEGIN
    IF :NEW.monto_colones < 0 OR (:NEW.monto_dolares IS NOT NULL AND :NEW.monto_dolares < 0) THEN
        RAISE_APPLICATION_ERROR(-22001, 'El monto de la transacción debe ser positivo.');
    END IF;
END;
/
-- AFTER INSERT:  mensaje de inserción
CREATE OR REPLACE TRIGGER trg_transacciones_ai
AFTER INSERT ON TRANSACCIONES
FOR EACH ROW
BEGIN
    DBMS_OUTPUT.PUT_LINE('Transacción registrada: ' || :NEW.id_transaccion);
END;
/

--5.CUENTAS_BANCARIAS
-- BEFORE UPDATE: valida saldo no negativo
CREATE OR REPLACE TRIGGER trg_cuentas_bu
BEFORE UPDATE ON CUENTAS_BANCARIAS
FOR EACH ROW
BEGIN
    IF :NEW.saldo_corte < 0 THEN
        RAISE_APPLICATION_ERROR(-21005, 'El saldo no puede ser negativo.');
    END IF;
END;
/

-- AFTER UPDATE: mensaje de actualización
CREATE OR REPLACE TRIGGER trg_cuentas_au
AFTER UPDATE ON CUENTAS_BANCARIAS
FOR EACH ROW
BEGIN
    DBMS_OUTPUT.PUT_LINE('Cuenta ' || :OLD.id_cuenta_bco || ' actualizada.');
END;
/

--6.BANCOS
-- BEFORE DELETE: valida que no tenga cuentas asociadas
CREATE OR REPLACE TRIGGER trg_bancos_bd
BEFORE DELETE ON BANCOS
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM CUENTAS_BANCARIAS
    WHERE id_banco = :OLD.id_banco;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-21006, 'No se puede eliminar: banco tiene cuentas asociadas.');
    END IF;
END;
/

-- AFTER DELETE: mensaje al eliminar
CREATE OR REPLACE TRIGGER trg_bancos_ad
AFTER DELETE ON BANCOS
FOR EACH ROW
BEGIN
    DBMS_OUTPUT.PUT_LINE('Banco eliminado: ' || :OLD.nombre_banco);
END;
/
