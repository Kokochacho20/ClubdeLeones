
--hace falta uno 


--Insrtar provincia revisando que solamente tenga letras y espacios en el nombre
CREATE OR REPLACE PROCEDURE insertar_provincia_regex (
    p_nombre_provincia IN PROVINCIAS.nombre_provincia%TYPE
)
IS
BEGIN
    IF NOT REGEXP_LIKE(p_nombre_provincia, '^[[:alpha:] ]+$') THEN
        RAISE_APPLICATION_ERROR(-20201, 'El nombre de la provincia debe contener solo letras y espacios.');
    END IF;

    INSERT INTO PROVINCIAS (nombre_provincia)
    VALUES (p_nombre_provincia);

    COMMIT;
END insertar_provincia_regex;
/

--Validar que al insertar en tabla bancos el teléfono tenga 8 dígitos
CREATE OR REPLACE PROCEDURE insertar_banco_regex (
    p_nombre_banco     IN BANCOS.nombre_banco%TYPE,
    p_tel_banco1       IN BANCOS.tel_banco1%TYPE,
    p_tel_banco2       IN BANCOS.tel_banco2%TYPE,
    p_contacto_banco1  IN BANCOS.contacto_banco1%TYPE,
    p_contacto_banco2  IN BANCOS.contacto_banco2%TYPE
)
IS
BEGIN
  
    IF NOT REGEXP_LIKE(p_tel_banco1, '^[0-9]{8}$') THEN
        RAISE_APPLICATION_ERROR(-20202, 'El telefono principal debe tener exactamente 8 digitos.');
    END IF;

    INSERT INTO BANCOS (
        nombre_banco, tel_banco1, tel_banco2,
        contacto_banco1, contacto_banco2
    )
    VALUES (
        p_nombre_banco, p_tel_banco1, p_tel_banco2,
        p_contacto_banco1, p_contacto_banco2
    );

    COMMIT;
END insertar_banco_regex;
/

--validar que el nombre del cantón solamente tenga letras y espacios
CREATE OR REPLACE PROCEDURE insertar_canton_regex (
    p_cod_provincia IN CANTONES.cod_provincia%TYPE,
    p_nombre_canton IN CANTONES.nombre_canton%TYPE
)
IS
    v_provincia_existe NUMBER := 0;
BEGIN
    -- Validar nombre del cantón: solo letras y espacios
    IF NOT REGEXP_LIKE(p_nombre_canton, '^[[:alpha:] ]+$') THEN
        RAISE_APPLICATION_ERROR(-20400, 'El nombre del canton debe contener solo letras y espacios.');
    END IF;

    -- Validar existencia de la provincia
    SELECT COUNT(*) INTO v_provincia_existe
    FROM PROVINCIAS
    WHERE cod_provincia = p_cod_provincia;

    IF v_provincia_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20401, 'La provincia especificada no existe.');
    END IF;

    -- Insertar cantón
    INSERT INTO CANTONES (cod_provincia, nombre_canton)
    VALUES (p_cod_provincia, p_nombre_canton);

    COMMIT;
END insertar_canton_regex;
/
