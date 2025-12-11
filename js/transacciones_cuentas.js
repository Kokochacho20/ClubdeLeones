const API_BASE = '../api';

// Formatear fecha a YYYY-MM-DD (Oracle friendly)
function formatearFecha(fecha) {
  const d = new Date(fecha);
  return d.toISOString().split('T')[0];
}

const formulario = document.getElementById('form');
const tablaCuerpo = document.getElementById('tabla-cuerpo');
const cuentaOrigenCMB = document.getElementById('cuenta_origen');
const cuentaDestinoCMB = document.getElementById('cuenta_destino');

// ============================================================
// CARGAR SELECTS DE CUENTAS BANCARIAS
// ============================================================
async function cargarSelects() {
  try {
    const res = await fetch(`${API_BASE}/cuentas_bancarias.php`);
    if (!res.ok) throw new Error('Error al cargar cuentas bancarias');
    const cuentas = await res.json();

    cuentaOrigenCMB.innerHTML = '<option value="" selected disabled>Seleccionar...</option>';
    cuentaDestinoCMB.innerHTML = '<option value="" selected disabled>Seleccionar...</option>';

    cuentas.forEach(c => {
      const id = c.ID_CUENTA_BCO || c.id_cuenta_bco;
      const nombre = c.NOMBRE_CUENTA_BCO || c.nombre_cuenta_bco;

      cuentaOrigenCMB.innerHTML += `<option value="${id}">${nombre}</option>`;
      cuentaDestinoCMB.innerHTML += `<option value="${id}">${nombre}</option>`;
    });

  } catch (err) {
    console.error(err);
    alert('Error al cargar datos');
  }
}

// ============================================================
// LISTAR TRANSACCIONES REGISTRADAS
// ============================================================
async function cargarTransacciones() {
  try {
    const res = await fetch(`${API_BASE}/transacciones_cuentas.php`);
    if (!res.ok) throw new Error('Error al cargar transacciones');
    const transacciones = await res.json();

    tablaCuerpo.innerHTML = '';
    transacciones.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.ID_TRANSAC_CTA}</td>
        <td>${t.TIPO_TRANSAC_CTA}</td>
        <td>${t.ID_CUENTA_BCO_ORIGEN}</td>
        <td>${t.ID_CUENTA_BCO_DESTINO}</td>
        <td>${t.MONEDA_TRANSAC_CTA == 'C' ? 'Colón' : 'Dólar'}</td>
        <td>${t.MONEDA_TRANSAC_CTA == 'C' ? t.MONTO_COLONES : t.MONTO_DOLARES}</td>
        <td>${t.FEC_TRANSAC_CTA}</td>
        <td>${t.CONCILIADA == 'N' ? 'Sin conciliar' : 'Conciliada'}</td>
      `;
      tablaCuerpo.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar las transacciones');
  }
}

// ============================================================
// CREAR NUEVA TRANSACCIÓN
// ============================================================
async function crearTransaccion(e) {
  e.preventDefault();

  // Obtener tipo de cambio
  const resTC = await fetch(`${API_BASE}/tipocambio.php`);
  if (!resTC.ok) {
    alert("Error al cargar tipo de cambio");
    return;
  }
  const tipos = await resTC.json();

  // Obtener último tipo de cambio
  const id_tip_cambio =
    tipos.sort((a, b) => new Date(b.fec_tip_cambio) - new Date(a.fec_tip_cambio))[0]
         .id_tip_cambio;

  // Valores del formulario
  const tipo_transac_cta = document.getElementById('tipo_transaccion').value.trim();
  const id_cuenta_bco_origen = document.getElementById('cuenta_origen').value.trim();
  const id_cuenta_bco_destino = document.getElementById('cuenta_destino').value.trim();
  const moneda_transac_cta = document.getElementById('tipo_moneda').value.trim();
  const monto = document.getElementById('monto').value.trim();

  if (!tipo_transac_cta || !id_cuenta_bco_origen || !id_cuenta_bco_destino ||
      !moneda_transac_cta || !monto) {
    alert('Complete todos los campos obligatorios');
    return;
  }

  // Montos según moneda
  const monto_colones = moneda_transac_cta === 'C' ? monto : 0;
  const monto_dolares = moneda_transac_cta === 'D' ? monto : 0;

  // Fechas formateadas
  const fec_transac_cta = formatearFecha(new Date());
  const fec_concilia = formatearFecha(new Date());
  const conciliada = 'S';

  // Payload a enviar al PHP
  const payload = {
    accion: 'crear',
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
  };

  try {
    const res = await fetch(`${API_BASE}/transacciones_cuentas.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const respuesta = await res.json();

    if (!res.ok || respuesta.ok === false) {
      throw new Error(respuesta.mensaje || "Error al crear transacción");
    }

    alert('Transacción creada correctamente');

    formulario.reset();
    cargarTransacciones();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// ============================================================
// EVENTOS
// ============================================================
formulario.addEventListener('submit', crearTransaccion);

document.addEventListener('DOMContentLoaded', () => {
  cargarTransacciones();
  cargarSelects();
});
