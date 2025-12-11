const API_BASE = '../api';

function formatearFecha(fecha) {
  const d = new Date(fecha);
  return d.toISOString().split('T')[0];
}

const formulario = document.getElementById('form');
const tablaCuerpo = document.getElementById('tabla-cuerpo');
const cuentaOrigenCMB = document.getElementById('cuenta_origen');
const cuentaDestinoCMB = document.getElementById('cuenta_destino');
const btnSubmit = document.getElementById('btn-submit');
const inputId = document.getElementById('id_transac_cta');

let modoEdicion = false;
let cacheTransacciones = [];


async function cargarSelects() {
  try {
    const res = await fetch(`${API_BASE}/cuentas_bancarias.php`);
    if (!res.ok) throw new Error('Error al cargar cuentas bancarias');
    const cuentas = await res.json();

    cuentaOrigenCMB.innerHTML = '<option value="" selected disabled>Seleccionar...</option>';
    cuentaDestinoCMB.innerHTML = '<option value="" selected disabled>Seleccionar...</option>';

    cuentas.forEach(c => {
      const id = c.ID_CUENTA_BCO || c.id_cuenta_bco;
      const nombre =
        c.NOMBRE_CUENTA_BCO ||
        c.nombre_cuenta_bco ||
        c.NOMBRE_CUENTA ||
        c.nombre_cuenta;

      if (!id || !nombre) return;

      cuentaOrigenCMB.innerHTML += `<option value="${id}">${nombre}</option>`;
      cuentaDestinoCMB.innerHTML += `<option value="${id}">${nombre}</option>`;
    });

  } catch (err) {
    console.error(err);
    alert('Error al cargar datos de cuentas');
  }
}

// LISTAR TRANSACCIONES 
async function cargarTransacciones() {
  try {

    const res = await fetch(`${API_BASE}/transacciones_cuentas.php`);
    if (!res.ok) throw new Error('Error al cargar transacciones');
    const transacciones = await res.json();
    cacheTransacciones = transacciones;

    tablaCuerpo.innerHTML = '';
    transacciones.forEach(t => {
      const id = t.ID_TRANSAC_CTA || t.id_transac_cta;
      const tipo = t.TIPO_TRANSAC_CTA || t.tipo_transac_cta;
      const origen = t.ID_CUENTA_BCO_ORIGEN || t.id_cuenta_bco_origen;
      const destino = t.ID_CUENTA_BCO_DESTINO || t.id_cuenta_bco_destino;
      const moneda = t.MONEDA_TRANSAC_CTA || t.moneda_transac_cta;
      const montoCol = t.MONTO_COLONES || t.monto_colones || 0;
      const montoDol = t.MONTO_DOLARES || t.monto_dolares || 0;
      const fecha = t.FEC_TRANSAC_CTA || t.fec_transac_cta;
      const conc = t.CONCILIADA || t.conciliada;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${id}</td>
        <td>${tipo}</td>
        <td>${origen}</td>
        <td>${destino}</td>
        <td>${moneda === 'C' ? 'Colón' : 'Dólar'}</td>
        <td>${moneda === 'C' ? montoCol : montoDol}</td>
        <td>${fecha}</td>
        <td>${conc === 'N' ? 'Sin conciliar' : 'Conciliada'}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="editarTransaccion(${id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarTransaccion(${id})">Eliminar</button>
        </td>
      `;
      tablaCuerpo.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar las transacciones');
  }
}


async function obtenerUltimoTipoCambio() {
  const resTC = await fetch(`${API_BASE}/tipo_cambio.php`);
  if (!resTC.ok) throw new Error("Error al cargar tipo de cambio");

  const raw = await resTC.text();
  console.log("tipo_cambio.php RAW:", raw);

  const tipos = JSON.parse(raw);

  if (!Array.isArray(tipos) || tipos.length === 0) {
    throw new Error("No hay tipos de cambio registrados");
  }

  tipos.sort((a, b) => {
    const fa = a.FEC_TIP_CAMBIO || a.fec_tip_cambio;
    const fb = b.FEC_TIP_CAMBIO || b.fec_tip_cambio;
    return new Date(fb) - new Date(fa);
  });

  const ultimo = tipos[0];
  const id_tip_cambio = ultimo.ID_TIP_CAMBIO || ultimo.id_tip_cambio;

  if (!id_tip_cambio) throw new Error("No se pudo determinar el ID de tipo de cambio");
  return id_tip_cambio;
}

function leerFormulario() {
  const tipo_transac_cta = document.getElementById('tipo_transaccion').value.trim();
  const id_cuenta_bco_origen = document.getElementById('cuenta_origen').value.trim();
  const id_cuenta_bco_destino = document.getElementById('cuenta_destino').value.trim();
  const moneda_transac_cta = document.getElementById('tipo_moneda').value.trim();
  const monto = document.getElementById('monto').value.trim();

  if (!tipo_transac_cta || !id_cuenta_bco_origen || !id_cuenta_bco_destino ||
    !moneda_transac_cta || !monto) {
    throw new Error('Complete todos los campos obligatorios');
  }

  const monto_colones = moneda_transac_cta === 'C' ? monto : 0;
  const monto_dolares = moneda_transac_cta === 'D' ? monto : 0;

  const fec_transac_cta = formatearFecha(new Date());
  const fec_concilia = formatearFecha(new Date());
  const conciliada = 'S';

  return {
    tipo_transac_cta,
    id_cuenta_bco_origen,
    id_cuenta_bco_destino,
    moneda_transac_cta,
    monto_colones,
    monto_dolares,
    fec_transac_cta,
    conciliada,
    fec_concilia
  };
}

// CREAR 
async function crearTransaccion(e) {
  e.preventDefault();

  try {
    const id_tip_cambio = await obtenerUltimoTipoCambio();
    const datos = leerFormulario();

    const payload = {
      accion: 'crear',
      ...datos,
      id_tip_cambio
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        formData.append(k, v);
      }
    });

    const res = await fetch(`${API_BASE}/transacciones_cuentas.php`, {
      method: 'POST',
      body: formData
    });

    const raw = await res.text();
    console.log("POST crear RAW:", raw);

    let respuesta;
    try {
      respuesta = JSON.parse(raw);
    } catch (e) {
      throw new Error("Respuesta inválida del servidor al crear");
    }

    if (!res.ok || respuesta.ok === false) {
      throw new Error(respuesta.mensaje || "Error al crear transacción");
    }

    alert('Transacción creada correctamente');
    formulario.reset();
    inputId.value = '';
    modoEdicion = false;
    btnSubmit.textContent = 'Guardar Transacción';
    cargarTransacciones();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

async function actualizarTransaccion(e) {
  e.preventDefault();

  const id = inputId.value;
  if (!id) {
    alert("No hay transacción seleccionada");
    return;
  }

  try {
    const id_tip_cambio = await obtenerUltimoTipoCambio();
    const datos = leerFormulario();

    const payload = {
      accion: 'actualizar',
      id_transac_cta: id,
      ...datos,
      id_tip_cambio
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        formData.append(k, v);
      }
    });

    const res = await fetch(`${API_BASE}/transacciones_cuentas.php`, {
      method: 'POST',
      body: formData
    });

    const raw = await res.text();
    console.log("POST actualizar RAW:", raw);

    let respuesta;
    try {
      respuesta = JSON.parse(raw);
    } catch (e) {
      throw new Error("Respuesta inválida del servidor al actualizar");
    }

    if (!res.ok || respuesta.ok === false) {
      throw new Error(respuesta.mensaje || "Error al actualizar transacción");
    }

    alert('Transacción actualizada correctamente');
    formulario.reset();
    inputId.value = '';
    modoEdicion = false;
    btnSubmit.textContent = 'Guardar Transacción';
    cargarTransacciones();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}


function manejarSubmit(e) {
  if (modoEdicion) {
    actualizarTransaccion(e);
  } else {
    crearTransaccion(e);
  }
}

//EDITAR
window.editarTransaccion = function (id) {
  const t = cacheTransacciones.find(x => (x.ID_TRANSAC_CTA || x.id_transac_cta) == id);
  if (!t) {
    alert("Transacción no encontrada");
    return;
  }

  inputId.value = t.ID_TRANSAC_CTA || t.id_transac_cta;
  document.getElementById('tipo_transaccion').value = t.TIPO_TRANSAC_CTA || t.tipo_transac_cta;
  document.getElementById('cuenta_origen').value = t.ID_CUENTA_BCO_ORIGEN || t.id_cuenta_bco_origen;
  document.getElementById('cuenta_destino').value = t.ID_CUENTA_BCO_DESTINO || t.id_cuenta_bco_destino;
  document.getElementById('tipo_moneda').value = t.MONEDA_TRANSAC_CTA || t.moneda_transac_cta;

  const moneda = t.MONEDA_TRANSAC_CTA || t.moneda_transac_cta;
  const monto = moneda === 'C'
    ? (t.MONTO_COLONES || t.monto_colones || 0)
    : (t.MONTO_DOLARES || t.monto_dolares || 0);
  document.getElementById('monto').value = monto;

  modoEdicion = true;
  btnSubmit.textContent = 'Actualizar Transacción';
};

//ELIMINAR
window.eliminarTransaccion = async function (id) {
  if (!confirm("¿Seguro que desea eliminar esta transacción?")) return;

  try {
    const payload = {
      accion: 'eliminar',
      id_transac_cta: id
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        formData.append(k, v);
      }
    });

    const res = await fetch(`${API_BASE}/transacciones_cuentas.php`, {
      method: 'POST',
      body: formData
    });

    const raw = await res.text();
    console.log("POST eliminar RAW:", raw);

    let respuesta;
    try {
      respuesta = JSON.parse(raw);
    } catch (e) {
      throw new Error("Respuesta inválida del servidor al eliminar");
    }

    if (!res.ok || respuesta.ok === false) {
      throw new Error(respuesta.mensaje || "Error al eliminar transacción");
    }

    alert('Transacción eliminada correctamente');
    formulario.reset();
    inputId.value = '';
    modoEdicion = false;
    btnSubmit.textContent = 'Guardar Transacción';
    cargarTransacciones();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

formulario.addEventListener('submit', manejarSubmit);

document.addEventListener('DOMContentLoaded', () => {
  cargarTransacciones();
  cargarSelects();
});
