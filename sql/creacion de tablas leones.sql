alter session set "_ORACLE_SCRIPT" = TRUE;

CREATE TABLESPACE TBS_LEONES 
DATAFILE 'C:\ORACLE\ORADATA\XE\DBF_LEONES.DBF' 
SIZE 75M DEFAULT STORAGE (INITIAL 1M NEXT 1M PCTINCREASE 0); 

--creación de usuario dueño de las tablas del sistema
CREATE USER ADMLEON IDENTIFIED BY ADMLEON
TEMPORARY TABLESPACE TEMP; 
GRANT CONNECT TO ADMLEON; 
GRANT RESOURCE TO ADMLEON; 
ALTER USER ADMLEON QUOTA UNLIMITED ON TBS_LEONES; 


--HU-01: Definición de Provincias 
--Tabla: Provincias 
CREATE TABLE PROVINCIAS (
    cod_provincia     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_provincia  VARCHAR2(15) NOT NULL
) TABLESPACE TBS_LEONES;


--HU-02: Definición de Cantones 
--Tabla: Cantones 
CREATE TABLE CANTONES(
    cod_canton      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_provincia   NUMBER NOT NULL,
    nombre_canton   VARCHAR2(50) NOT NULL,
    CONSTRAINT fk_canton_provincia FOREIGN KEY (cod_provincia) REFERENCES provincias(cod_provincia)
) TABLESPACE TBS_LEONES;


--HU-03: Definición de Distritos 
--Tabla: Distritos 
CREATE TABLE DISTRITOS(
    cod_distrito      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_provincia     NUMBER NOT NULL,
    cod_canton        NUMBER NOT NULL,
    nombre_distrito   VARCHAR2(50) NOT NULL,
    CONSTRAINT fk_distrito_provincia FOREIGN KEY (cod_provincia) REFERENCES provincias(cod_provincia),
    CONSTRAINT fk_distrito_canton    FOREIGN KEY (cod_canton)    REFERENCES cantones(cod_canton)
) TABLESPACE TBS_LEONES;


--HU-04: Tipos de Cambio 
--Tabla: Tipo_cambio 
CREATE TABLE TIPO_CAMBIO (
    id_tip_cambio   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fec_tip_cambio  DATE NOT NULL,
    tc_compra       NUMBER(8,2) NOT NULL,
    tc_venta        NUMBER(8,2) NOT NULL
) TABLESPACE TBS_LEONES;


--HU-05: Tipos de Actividad 
--Tabla: Tipo_actividad 
CREATE TABLE TIPO_ACTIVIDAD (
    id_tip_actividad     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_tip_actividad VARCHAR2(100) NOT NULL,
    tipo_actividad       VARCHAR2(1) DEFAULT 'C' NOT NULL,
    CONSTRAINT chk_tipo_actividad CHECK (tipo_actividad IN ('I','C','G'))
) TABLESPACE TBS_LEONES;
--tipo_actividad (I=actividad que genera ingreso, C=Cuota mensual, G=actividad que genera egreso) 


--HU-06: Registro de Socios 
--Tabla: Socios 
CREATE TABLE SOCIOS (
    id_socio          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_socio      VARCHAR2(150) NOT NULL,
    fecha_nacimiento  DATE,
    fecha_ingreso     DATE NOT NULL,
    número_socio      NUMBER NOT NULL,
    cod_distrito      NUMBER,
    desc_direccion    VARCHAR2(250),
    telefono1         NUMBER(10) NOT NULL,
    telefono2         NUMBER(10),
    tipo_socio        VARCHAR2(1) DEFAULT 'R' NOT NULL,
    estado_socio      VARCHAR2(1) DEFAULT 'A' NOT NULL, 
    CONSTRAINT fk_distrito_soc   FOREIGN KEY (cod_distrito) REFERENCES distritos(cod_distrito),
    CONSTRAINT chk_tipo_socio    CHECK (tipo_socio IN ('R','C','H','B','L')),
    CONSTRAINT chk_estado_socio  CHECK (estado_socio IN ('A','I','N'))
) TABLESPACE TBS_LEONES;
--tipo_socio (R=Regulares, C=Cachorros, H=Honorarios, B=Benefactores, L=Leos)
--estado_socio (A=Activo, I=Inactivo, N=ya no forma parte del Club) 


--HU-07: Tipos de Pago 
--Tabla: Tipo_Pago 
CREATE TABLE TIPO_PAGO (
    id_tip_pago     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_tip_pago VARCHAR2(20) NOT NULL,
    periodicidad    VARCHAR2(1) DEFAULT 'M' NOT NULL,
    tipo            VARCHAR2(1) DEFAULT 'I' NOT NULL, 
    moneda          VARCHAR2(1) DEFAULT 'C' NOT NULL,
    CONSTRAINT chk_periodicidad_tp CHECK (periodicidad IN ('M','T','D')),
    CONSTRAINT chk_tipo_tp         CHECK (tipo IN ('I','E')),
    CONSTRAINT chk_moneda_tp       CHECK (moneda IN ('C','D'))
) TABLESPACE TBS_LEONES;
--periodicidad (M=mensual, T=un solo pago, D=distribuido) 
--tipo (I=Ingreso, E=Egreso) 
--moneda (C=Colones, D=Dólares),


--HU-08: Bancos 
--Tabla: Bancos 
CREATE TABLE BANCOS (
    id_Banco        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_banco    VARCHAR2(100) NOT NULL,
    tel_banco1      NUMBER(10) NOT NULL,
    tel_banco2      NUMBER(10),
    contacto_banco1 VARCHAR2(150) NOT NULL,
    contacto_banco2 VARCHAR2(150)
) TABLESPACE TBS_LEONES;


--HU-09: Cuentas Bancarias 
--Tabla: Cuentas_Bancarias 
CREATE TABLE CUENTAS_BANCARIAS (
    id_cuenta_bco      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_cuenta_bco  VARCHAR2(150) NOT NULL,
    id_Banco           NUMBER NOT NULL,
    moneda_cuenta_bco  VARCHAR2(1) DEFAULT 'C' NOT NULL, 
    fec_corte          DATE,
    saldo_corte        NUMBER(17,2),
    CONSTRAINT fk_cta_bco_bco FOREIGN KEY (id_banco) REFERENCES bancos(id_banco),
    CONSTRAINT moneda_cb      CHECK (moneda_cuenta_bco IN ('C','D'))
) TABLESPACE TBS_LEONES;
--moneda_cuenta_bco (C=Colones, D=Dólares) 


--HU-10: Registro de actividades  
--Tabla: Actividades 
CREATE TABLE ACTIVIDADES (
    id_actividad      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_actividad  VARCHAR2(150) NOT NULL,
    id_tip_actividad  NUMBER NOT NULL,
    fecha_actividad   DATE NOT NULL,
    lugar_actividad   VARCHAR2(150) NOT NULL,
    hora_actividad    DATE NOT NULL,
    id_tip_pago       NUMBER NOT NULL,
    descrip_actividad VARCHAR2(250),
    costo_actividad   NUMBER(17,2) NOT NULL,
    moneda_actividad  VARCHAR2(1) DEFAULT 'C' NOT NULL,
    id_cuenta_bco     NUMBER NOT NULL,
    CONSTRAINT fk_bco_activ            FOREIGN KEY (id_cuenta_bco)     REFERENCES cuentas_bancarias(id_cuenta_bco),
    CONSTRAINT fk_tip_tip_activ_activ  FOREIGN KEY (id_tip_actividad)  REFERENCES tipo_actividad(id_tip_actividad),
    CONSTRAINT fk_tip_pag_activ        FOREIGN KEY (id_tip_pago)       REFERENCES tipo_pago(id_tip_pago),
    CONSTRAINT moneda_act              CHECK (moneda_actividad IN ('C','D'))
) TABLESPACE TBS_LEONES;
--moneda_actividad (C=Colones, D=Dólares) 


--HU-11: Registro de actividades por socio 
--Tabla: Activ_Socio 
CREATE TABLE ACTIV_SOCIO (
    id_activ_soc   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_actividad   NUMBER NOT NULL,
    id_socio       NUMBER NOT NULL,
    fec_comprom    DATE,
    estado         VARCHAR2(1) DEFAULT 'R' NOT NULL, 
    fec_cancela    DATE,
    monto_Comprom  NUMBER(17,2) NOT NULL,
    saldo_Comprom  NUMBER(17,2) NOT NULL,
    CONSTRAINT fk_activ_socio_act FOREIGN KEY (id_actividad) REFERENCES actividades(id_actividad),
    CONSTRAINT fk_activ_socio_soc FOREIGN KEY (id_socio)     REFERENCES socios(id_socio),
    CONSTRAINT chk_estado_act_soc CHECK (estado IN ('R','C','P'))
) TABLESPACE TBS_LEONES;
--estado (R:Registrado, C:Cancelado, P:En proceso) 


--HU-12: Registro de ingresos y egresos por actividad 
--Tabla: Transacciones 
CREATE TABLE TRANSACCIONES (
    id_transaccion  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_activ_soc    NUMBER NOT NULL,
    fec_transaccion DATE NOT NULL,
    id_tip_pago     NUMBER NOT NULL,
    mes_pago        NUMBER NOT NULL,
    an_pago         NUMBER NOT NULL,
    moneda_transac  VARCHAR2(1) DEFAULT 'C' NOT NULL, 
    monto_colones   NUMBER(17,2) NOT NULL,
    monto_dolares   NUMBER(17,2),
    id_tip_cambio   NUMBER NOT NULL,
    CONSTRAINT fk_activ_socio_tr FOREIGN KEY (id_activ_soc)   REFERENCES activ_socio(id_activ_soc),
    CONSTRAINT fk_tip_pag_tr     FOREIGN KEY (id_tip_pago)    REFERENCES tipo_pago(id_tip_pago),
    CONSTRAINT fk_tip_camb_tr    FOREIGN KEY (id_tip_cambio)  REFERENCES tipo_cambio(id_tip_cambio),
    CONSTRAINT moneda_tr         CHECK (moneda_transac IN ('C','D'))
) TABLESPACE TBS_LEONES;
--moneda_transac  VARCHAR2(1) NOT NULL DEFAULT 'C', 


--HU-13: Registro de transacciones en cuentas bancarias 
--Tabla: Transac_cta 
CREATE TABLE TRANSAC_CTA (
    id_transac_cta        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo_transac_cta      VARCHAR2(1) DEFAULT 'D' NOT NULL,
    id_cuenta_bco_origen  NUMBER NOT NULL,
    id_cuenta_bco_destino NUMBER NOT NULL,
    moneda_transac_cta    VARCHAR2(1) DEFAULT 'C' NOT NULL, 
    monto_colones         NUMBER(17,2) NOT NULL,
    monto_dolares         NUMBER(17,2),
    id_tip_cambio         NUMBER NOT NULL,
    fec_transac_cta       DATE NOT NULL,
    conciliada            VARCHAR2(1) DEFAULT 'N' NOT NULL,
    fec_concilia          DATE,
    CONSTRAINT fk_cta_bco_or_tr  FOREIGN KEY (id_cuenta_bco_origen)  REFERENCES cuentas_bancarias(id_cuenta_bco),
    CONSTRAINT fk_cta_bco_de_tr  FOREIGN KEY (id_cuenta_bco_destino) REFERENCES cuentas_bancarias(id_cuenta_bco),
    CONSTRAINT fk_tip_camb_tr_ct FOREIGN KEY (id_tip_cambio)         REFERENCES tipo_cambio(id_tip_cambio),
    CONSTRAINT moneda_tr_cta     CHECK (moneda_transac_cta IN ('C','D')),
    CONSTRAINT tip_tr_cta        CHECK (tipo_transac_cta IN ('D','R','T')),
    CONSTRAINT conc_tr_cta       CHECK (conciliada IN ('S','N'))
) TABLESPACE TBS_LEONES;
--moneda_transac_cta (C=Colones, D=Dólares) 
--tipo_transac_cta (D=Depósito, R=Retiro, C=Cheque, T=Transferencia) 
--conciliada (S=Sí N=No)

--14: Gestión de usuarios del sistema
CREATE TABLE USUARIOS (
    id_usuario        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_usuario    VARCHAR2(100)      NOT NULL,
    correo_usuario    VARCHAR2(150)      UNIQUE NOT NULL,
    clave_usuario     VARCHAR2(200)      NOT NULL,
    telefono_usuario  VARCHAR2(20),
    rol_usuario       VARCHAR2(20)       DEFAULT 'SOCIO' NOT NULL,
    estado_usuario    VARCHAR2(1)        DEFAULT 'A' NOT NULL,
    fecha_registro    DATE               DEFAULT SYSDATE NOT NULL,

    CONSTRAINT chk_estado_usuario CHECK (
        estado_usuario IN ('A','I')
    ),
    CONSTRAINT chk_rol_usuario CHECK (
        rol_usuario IN ('ADMIN','PRESIDENTE','SOCIO','TESORERO','SECRETARIO')
    )
) TABLESPACE TBS_LEONES;

commit;
