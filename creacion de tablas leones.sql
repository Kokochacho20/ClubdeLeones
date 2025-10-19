use leones;
#esquema proyecto Club de Leones
#My SQL

#Tablas del Sistema 

#HU-01: Definición de Provincias 
#Tabla: Provincias 
#Campos: 
CREATE TABLE provincias(
cod_provincia INT NOT NULL AUTO_INCREMENT,
nombre_provincia VARCHAR(50) NOT NULL,
PRIMARY KEY (cod_provincia))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#HU-02: Definición de Cantones 
#Tabla: Cantones 
#Campos: 
CREATE TABLE cantones(
cod_canton INT NOT NULL AUTO_INCREMENT,
nombre_canton VARCHAR(100) NOT NULL,
cod_provincia INT NOT NULL,
PRIMARY KEY (cod_canton),
FOREIGN KEY (cod_provincia) REFERENCES provincias(cod_provincia))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;


#HU-03: Definición de Distritos 
#Tabla: Distritos 
#Campos: 
CREATE TABLE distritos(
cod_distrito INT NOT NULL AUTO_INCREMENT,
nombre_distrito VARCHAR(100) NOT NULL,
cod_provincia INT NOT NULL,
cod_canton INT NOT NULL,
PRIMARY KEY (cod_distrito),
FOREIGN KEY (cod_provincia) REFERENCES provincias(cod_provincia),
FOREIGN KEY (cod_canton) REFERENCES cantones(cod_canton))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#HU-04: Tipos de Cambio 
#Tabla: Tipo_cambio 
#Campos: 
CREATE TABLE tipo_cambio(
id_tip_cambio INT NOT NULL AUTO_INCREMENT,
fec_tip_cambio DATE,
tc_compra DECIMAL(10,2) NOT NULL,
tc_venta DECIMAL(10,2) NOT NULL,
PRIMARY KEY (id_tip_cambio))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#HU-05: Tipos de Actividad 
#Tabla: Tipo_actividad 
#Campos:
CREATE TABLE tipo_actividad( 
id_tip_actividad INT NOT NULL AUTO_INCREMENT,
nombre_tip_actividad VARCHAR(150), 
tipo_actividad varchar(1) NOT NULL,
PRIMARY KEY (id_tip_actividad),
CONSTRAINT chk_tipo_actividad CHECK (tipo_actividad IN ('I', 'C','G')))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#tipo_actividad (I=actividad que genera ingreso, C=Cuota mensual, G=actividad que genera egreso) 

#HU-06: Registro de Socios 
#Tabla: Socios 
#Campos: 
CREATE TABLE socios(
id_socio INT NOT NULL AUTO_INCREMENT,
nombre_socio VARCHAR(100) NOT NULL,
apellido1_socio VARCHAR(100) NOT NULL,
apellido2_socio VARCHAR(100) NOT NULL,
fecha_nacimiento DATE,
fecha_ingreso DATE NOT NULL,
número_socio INT NOT NULL,
desc_direccion VARCHAR(250),
telefono1 INT,
telefono2 INT,
tipo_socio VARCHAR(1),
estado_socio VARCHAR(1),
cod_distrito INT,
PRIMARY KEY (id_socio),
FOREIGN KEY (cod_distrito) REFERENCES distritos(cod_distrito),
CONSTRAINT chk_tipo_socio CHECK (tipo_socio IN ('R', 'H','B','L','C')),
CONSTRAINT chk_estado_socio CHECK (estado_socio IN ('A', 'I','N')))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#para tipo_socio los valores pueden ser: 
#R= Socio regular
#H= Socio honorario
#B= Socio benefactor
#L= Socio Leo
#C= Socio Cachorro

#para estado_socio los valores pueden ser:
#(A=Activo, I=Inactivo, N=ya no forma parte del Club) 

#HU-07: Tipos de Pago 
#Tabla: Tipo_Pago 
#Campos:
CREATE TABLE tipo_pago( 
id_tip_pago INT NOT NULL AUTO_INCREMENT,
nombre_tip_pago VARCHAR(50) NOT NULL,
periodicidad VARCHAR(1) NOT NULL,
tipo VARCHAR(1) NOT NULL,
moneda_tp VARCHAR(1) NOT NULL,
PRIMARY KEY (id_tip_pago),
CONSTRAINT chk_periodicidad CHECK (periodicidad IN ('M', 'T','D')),
CONSTRAINT chk_tipo CHECK (tipo IN ('I', 'E')),
CONSTRAINT chk_moneda_tp CHECK (moneda_tp IN ('C', 'D')))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#periodicidad (M=mensual, T=un solo pago, D=distribuido)
#tipo (I=Ingreso, E=Egreso) 
#moneda_tp (C=Colones, D=Dólares) 

#HU-08: Bancos 
#Tabla: Bancos 
#Campos: 
CREATE TABLE bancos(
id_banco INT NOT NULL AUTO_INCREMENT,
nombre_banco VARCHAR(100) NOT NULL,
tel_banco1 INT,
tel_banco2 INT,
contacto_banco1 VARCHAR(250), 
contacto_banco2 VARCHAR(250), 
PRIMARY KEY (id_banco))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#HU-09: Cuentas Bancarias 
#Tabla: Cuentas_Bancarias 
#Campos: 
CREATE TABLE cuentas_bancarias(
id_cuenta_bco INT NOT NULL AUTO_INCREMENT,
nombre_cuenta_bco VARCHAR(150) NOT NULL,
moneda_cuenta_bco VARCHAR(1) NOT NULL,
fec_corte DATE,
saldo_corte DECIMAL(17,2),
id_Banco INT NOT NULL,
PRIMARY KEY (id_cuenta_bco),
FOREIGN KEY (id_Banco) REFERENCES bancos(id_Banco),
CONSTRAINT chk_moneda_cuenta_bco CHECK (moneda_cuenta_bco IN ('C', 'D')))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

# moneda_cuenta_bco (C=Colones, D=Dólares) 

#HU-10: Registro de actividades  
#Tabla: Actividades 
#Campos: 
CREATE TABLE actividades(
id_actividad INT NOT NULL AUTO_INCREMENT,
nombre_actividad VARCHAR(150) NOT NULL, 
fecha_actividad DATE,
lugar_actividad VARCHAR(150),
hora_actividad  TIME,
descrip_actividad VARCHAR(250),
costo_actividad DECIMAL(17,2),
moneda_actividad VARCHAR(1) NOT NULL, 
id_tip_actividad INT NOT NULL,
id_cuenta_bco INT NOT NULL,
id_tip_pago INT NOT NULL,
PRIMARY KEY (id_actividad),
FOREIGN KEY (id_tip_actividad) REFERENCES tipo_actividad(id_tip_actividad),
FOREIGN KEY (id_cuenta_bco) REFERENCES cuentas_bancarias(id_cuenta_bco),
FOREIGN KEY (id_tip_pago ) REFERENCES tipo_pago(id_tip_pago ),
CONSTRAINT chk_moneda_actividad CHECK (moneda_actividad IN ('C', 'D')))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#moneda_actividad (C=Colones, D=Dólares) 

#HU-11: Registro de actividades por socio 
#Tabla: Activ_Socio 
#Campos: 
CREATE TABLE activ_socio(
id_activ_soc INT NOT NULL AUTO_INCREMENT,
fec_comprom DATE,
estado_activ_soc VARCHAR(1),
fec_cancela DATE,
monto_comprom DECIMAL(17,2),
saldo_comprom DECIMAL(17,2),
id_actividad INT NOT NULL,
id_socio INT NOT NULL,
PRIMARY KEY (id_activ_soc),
FOREIGN KEY (id_actividad) REFERENCES actividades(id_actividad),
FOREIGN KEY (id_socio) REFERENCES socios(id_socio),
CONSTRAINT chk_estado_activ_soc CHECK (estado_activ_soc IN ('R', 'C','P')))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#estado_activ_soc (R:Registrado, C:Cancelado, P:En proceso) 

#HU-12: Registro de ingresos y egresos por actividad 
#Tabla: Transacciones 
#Campos: 
CREATE TABLE transacciones(
id_transaccion INT NOT NULL AUTO_INCREMENT,
fec_Transaccion DATE NOT NULL,
monto DECIMAL(17,2),
mes_pago INT,
an_pago INT,
moneda_transac VARCHAR(1),
monto_colones DECIMAL(17,2),
monto_dolares DECIMAL(17,2),
tipo_cambio DECIMAL(10,2),
id_activ_soc INT NOT NULL,
id_tip_pago INT NOT NULL,
PRIMARY KEY (id_transaccion),
FOREIGN KEY (id_activ_soc) REFERENCES activ_socio(id_activ_soc),
FOREIGN KEY (id_tip_pago) REFERENCES tipo_pago(id_tip_pago),
CONSTRAINT chk_moneda_transac CHECK (moneda_transac IN ('C','D')))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#moneda_transac (C=Colones, D=Dólares) 

#HU-13: Registro de transacciones en cuentas bancarias 
#Tabla: Transac_cta 
#Campos: 
CREATE TABLE transac_cta(
id_transac_cta INT NOT NULL AUTO_INCREMENT,
tipo_transac_cta VARCHAR(1) NOT NULL,
moneda_transac_cta VARCHAR(1) NOT NULL,
monto_colones DECIMAL(17,2),
monto_dolares  DECIMAL(17,2),
tipo_cambio DECIMAL(10,2),
fec_transac_cta DATE NOT NULL,
conciliada VARCHAR(1),
fec_concilia DATE,
id_cuenta_bco_origen INT NOT NULL,
id_cuenta_bco_destino INT NOT NULL,
PRIMARY KEY (id_transac_cta),
FOREIGN KEY (id_cuenta_bco_origen) REFERENCES cuentas_bancarias(id_cuenta_bco),
FOREIGN KEY (id_cuenta_bco_destino) REFERENCES cuentas_bancarias(id_cuenta_bco),
CONSTRAINT chk_tipo_transac_cta CHECK (tipo_transac_cta IN ('D','R','C','T')),
CONSTRAINT chk_moneda_transac_cta CHECK (moneda_transac_cta IN ('C','D')),
CONSTRAINT chk_conciliada CHECK (conciliada IN ('S','N')))
ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

#tipo_transac_cta (D=Depósito, R=Retiro, C=Cheque, T=Transferencia) 
#moneda_transac_cta (C=Colones, D=Dólares)
#conciliada (S=Sí N=No) 