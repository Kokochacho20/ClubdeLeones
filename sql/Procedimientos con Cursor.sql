--hacer un join para mostrar el id de socio y el id de la actividad junto con sus nombres
CREATE OR REPLACE PROCEDURE listar_actividades_socios (
    p_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_cursor FOR
        SELECT 
            asoc.id_activ_soc,
            act.nombre_actividad,
            soc.nombre_socio
        FROM activ_socio asoc
        JOIN actividades act ON act.id_actividad = asoc.id_actividad
        JOIN socios soc ON soc.id_socio = asoc.id_socio
        ORDER BY asoc.id_activ_soc;
END listar_actividades_socios;
/

--cursor para reporte_ingresos_egresos_actividad
CREATE OR REPLACE PROCEDURE reporte_ingresos_egresos_actividad (
    p_id_actividad IN  ACTIVIDADES.id_actividad%TYPE,
    p_fecha_desde IN  DATE,
    p_fecha_hasta IN  DATE,
    p_tipo_filtro IN  VARCHAR2,
    p_cursor OUT SYS_REFCURSOR,
    p_total_ingresos OUT NUMBER,
    p_total_egresos  OUT NUMBER,
    p_balance_final  OUT NUMBER
)
AS
BEGIN

    SELECT
        NVL(SUM(CASE WHEN tp.tipo = 'I' THEN t.monto_colones ELSE 0 END), 0),
        NVL(SUM(CASE WHEN tp.tipo = 'E' THEN t.monto_colones ELSE 0 END), 0)
    INTO
        p_total_ingresos,
        p_total_egresos
    FROM TRANSACCIONES t
    JOIN ACTIV_SOCIO asoc ON asoc.id_activ_soc = t.id_activ_soc
    JOIN TIPO_PAGO tp     ON tp.id_tip_pago   = t.id_tip_pago
    WHERE asoc.id_actividad = p_id_actividad
      AND t.fec_transaccion BETWEEN p_fecha_desde AND p_fecha_hasta
      AND (p_tipo_filtro IS NULL OR tp.tipo = p_tipo_filtro);

    p_balance_final := p_total_ingresos - p_total_egresos;

    OPEN p_cursor FOR
        SELECT
            t.id_transaccion,
            t.fec_transaccion,
            tp.tipo            AS tipo_movimiento,
            tp.nombre_tip_pago AS tipo_pago,
            t.monto_colones    AS monto,
            s.nombre_socio,
            asoc.id_socio
        FROM TRANSACCIONES t
        JOIN ACTIV_SOCIO asoc ON asoc.id_activ_soc = t.id_activ_soc
        JOIN SOCIOS s ON s.id_socio = asoc.id_socio
        JOIN TIPO_PAGO tp ON tp.id_tip_pago = t.id_tip_pago
        WHERE asoc.id_actividad = p_id_actividad
          AND t.fec_transaccion BETWEEN p_fecha_desde AND p_fecha_hasta
          AND (p_tipo_filtro IS NULL OR tp.tipo = p_tipo_filtro)
        ORDER BY t.fec_transaccion;
END;
/


--cursor para reporte_pagos_cuotas_socio --falta implementar
CREATE OR REPLACE PROCEDURE reporte_pagos_cuotas_socio (
    p_id_socio IN  SOCIOS.id_socio%TYPE,
    p_fecha_desde IN  DATE,
    p_fecha_hasta  IN  DATE,
    p_cursor OUT SYS_REFCURSOR,
    p_total_periodo OUT NUMBER
)
AS
BEGIN

    SELECT NVL(SUM(t.monto_colones), 0)
    INTO   p_total_periodo
    FROM TRANSACCIONES t
    JOIN ACTIV_SOCIO asoc ON asoc.id_activ_soc = t.id_activ_soc
    WHERE asoc.id_socio = p_id_socio
      AND t.fec_transaccion BETWEEN p_fecha_desde AND p_fecha_hasta;

    OPEN p_cursor FOR
        SELECT
            t.fec_transaccion,
            t.monto_colones,
            t.monto_dolares,
            t.moneda_transac,
            tp.nombre_tip_pago,
            tp.tipo,
            a.nombre_actividad,
            t.mes_pago,
            t.an_pago
        FROM TRANSACCIONES t
        JOIN ACTIV_SOCIO asoc ON asoc.id_activ_soc = t.id_activ_soc
        JOIN ACTIVIDADES a ON a.id_actividad = asoc.id_actividad
        JOIN TIPO_PAGO tp ON tp.id_tip_pago = t.id_tip_pago
        WHERE asoc.id_socio = p_id_socio
          AND t.fec_transaccion BETWEEN p_fecha_desde AND p_fecha_hasta
        ORDER BY t.fec_transaccion;
END;
/

--cursor para facturacion --falta implementar 
CREATE OR REPLACE PROCEDURE obtener_recibo_pago (
    p_id_transaccion IN TRANSACCIONES.id_transaccion%TYPE,
    p_cursor         OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_cursor FOR
        SELECT
            t.id_transaccion,
            t.fec_transaccion,
            tp.nombre_tip_pago,
            tp.tipo,
            t.monto_colones,
            t.monto_dolares,
            t.moneda_transac,
            s.id_socio,
            s.nombre_socio,
            s.número_socio,
            a.nombre_actividad,
            a.fecha_actividad,
            a.lugar_actividad,
            tc.tc_compra,
            tc.tc_venta,
            tc.fec_tip_cambio
        FROM TRANSACCIONES t
        JOIN ACTIV_SOCIO asoc ON asoc.id_activ_soc = t.id_activ_soc
        JOIN SOCIOS s ON s.id_socio = asoc.id_socio
        JOIN ACTIVIDADES a ON a.id_actividad = asoc.id_actividad
        JOIN TIPO_PAGO tp ON tp.id_tip_pago = t.id_tip_pago
        JOIN TIPO_CAMBIO tc   ON tc.id_tip_cambio = t.id_tip_cambio
        WHERE t.id_transaccion = p_id_transaccion;
END;
/


