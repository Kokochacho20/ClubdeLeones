const API_BASE = '../api';

const formulario = document.getElementById('form');
const tablaCuerpo = document.getElementById('tabla-cuerpo');
const cuentaOrigenCMB = document.getElementById('cuenta_origen');
const cuentaDestinoCMB = document.getElementById('cuenta_destino');

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

      cuentaOrigenCMB.innerHTML += `
        <option value="${id}">${nombre}</option>
      `;

      cuentaDestinoCMB.innerHTML += `
        <option value="${id}">${nombre}</option>
      `;
    });

  } catch (err) {
    console.error(err);
    alert('Error al cargar datos');
  }
}



// listar transacciones
async function cargarTransacciones() {
  try {
    const res = await fetch(`${API_BASE}/transacciones_cuentas.php`);
    if (!res.ok) throw new Error('Error al cargar transacciones de cuenta');
    const transacciones = await res.json();

    tablaCuerpo.innerHTML = '';
    transacciones.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.ID_TRANSAC_CTA}</td>
        <td>${t.TIPO_TRANSAC_CTA}</td>
        <td>${t.ID_CUENTA_BCO_ORIGEN}</td>
        <td>${t.ID_CUENTA_BCO_DESTINO}</td>
        <td>${t.MONEDA_TRANSAC_CTA == 'C' ? 'Colon' : 'Dolar'}</td>
        <td>${t.MONEDA_TRANSAC_CTA == 'C' ? t.MONTO_COLONES : t.MONTO_DOLARES}</td>
        <td>${t.FEC_TRANSAC_CTA}</td>
        <td>${t.CONCILIADA == 'N' ? 'Sin conciliar' : 'Conciliada'}</td>
      `;
      tablaCuerpo.appendChild(tr);
    });
    //asignarEventosAcciones();
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar las transacciones de cuenta');
  }
}

// Crear transacción
async function crearTransaccion(e) {

  const res = await fetch(`${API_BASE}/tipocambio.php`);
  if (!res.ok) throw new Error('Error al cargar tipo de cambio');
  const tipos = await res.json();

  e.preventDefault();
  const tipo_transac_cta = document.getElementById('tipo_transaccion').value.trim();
  const id_cuenta_bco_origen = document.getElementById('cuenta_origen').value.trim();
  const id_cuenta_bco_destino = document.getElementById('cuenta_destino').value.trim();
  const moneda_transac_cta = document.getElementById('tipo_moneda').value.trim();
  const monto = document.getElementById('monto').value.trim();

  if (!tipo_transac_cta || !id_cuenta_bco_origen || !id_cuenta_bco_destino || !moneda_transac_cta || !monto) {
    alert('Complete todos los campos obligatorios');
    return;
  }

  const monto_colones = moneda_transac_cta == 'C' ? monto : 0;
  const monto_dolares = moneda_transac_cta == 'D' ? monto : 0;
  const id_tip_cambio = tipos.sort((a, b) => new Date(b.fec_tip_cambio) - new Date(a.fec_tip_cambio))[0].id_tip_cambio;
  const fec_transac_cta = new Date();
  const conciliada = 'S';
  const fec_concilia = new Date();


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
      throw new Error(respuesta.mensaje || 'Error al crear transacción de cuenta');
    }
    alert(respuesta.mensaje || 'Transacción de cuenta creada correctamente');
    formulario.reset();
    cargarTransacciones();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}
formulario.addEventListener('submit', crearTransaccion);

document.addEventListener('DOMContentLoaded', () => {
  cargarTransacciones();
  cargarSelects();
});
