const API_BASE = './api';

const formTransacCta = document.getElementById('form-transaccta');
const tbodyTransacCta = document.getElementById('tbody-transaccta');

// listado transacciones de cuenta
async function cargarTransacCta() {
  try {
    const res = await fetch(`${API_BASE}/transaccta.php`);
    if (!res.ok) throw new Error('Error al cargar transacciones de cuenta');
    const transacciones = await res.json();

    tbodyTransacCta.innerHTML = '';
    transacciones.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.ID_TRANSAC_CTA}</td>
        <td>${t.TIPO_TRANSAC_CTA}</td>
        <td>${t.ID_CUENTA_BCO_ORIGEN}</td>
        <td>${t.ID_CUENTA_BCO_DESTINO}</td>
        <td>${t.MONEDA_TRANSAC_CTA}</td>
        <td>${t.MONTO_COLONES}</td>
        <td>${t.MONTO_DOLARES ?? ''}</td>
        <td>${t.ID_TIP_CAMBIO}</td>
        <td>${t.FEC_TRANSAC_CTA}</td>
        <td>${t.CONCILIADA}</td>
        <td>${t.FEC_CONCILIA ?? ''}</td>
        <td>
          <button class="btn btn-sm btn-amarillo btn-editar" data-id="${t.ID_TRANSAC_CTA}">Editar</button>
          <button class="btn btn-sm btn-danger btn-eliminar" data-id="${t.ID_TRANSAC_CTA}">Eliminar</button>
        </td>
      `;
      tbodyTransacCta.appendChild(tr);
    });
    asignarEventosAcciones();
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar las transacciones de cuenta');
  }
}

// CRUD crear transacción de cuenta
async function crearTransacCta(e) {
  e.preventDefault();
  const tipo_transac_cta = document.getElementById('tipo_transac_cta').value.trim();
  const id_cuenta_bco_origen = document.getElementById('id_cuenta_bco_origen').value.trim();
  const id_cuenta_bco_destino = document.getElementById('id_cuenta_bco_destino').value.trim();
  const moneda_transac_cta = document.getElementById('moneda_transac_cta').value.trim();
  const monto_colones = document.getElementById('monto_colones').value.trim();
  const monto_dolares = document.getElementById('monto_dolares').value.trim();
  const id_tip_cambio = document.getElementById('id_tip_cambio').value.trim();
  const fec_transac_cta = document.getElementById('fec_transac_cta').value.trim();
  const conciliada = document.getElementById('conciliada').value.trim();
  const fec_concilia = document.getElementById('fec_concilia').value.trim();

  if (!tipo_transac_cta || !id_cuenta_bco_origen || !id_cuenta_bco_destino || !moneda_transac_cta || !monto_colones || !id_tip_cambio || !fec_transac_cta || !conciliada) {
    alert('Complete todos los campos obligatorios');
    return;
  }

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
    const res = await fetch(`${API_BASE}/transaccta.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const respuesta = await res.json();
    if (!res.ok || respuesta.ok === false) {
      throw new Error(respuesta.mensaje || 'Error al crear transacción de cuenta');
    }
    alert(respuesta.mensaje || 'Transacción de cuenta creada correctamente');
    formTransacCta.reset();
    cargarTransacCta();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}
formTransacCta.addEventListener('submit', crearTransacCta);

// CRUD eliminar transacción de cuenta
function asignarEventosAcciones() {
  const botonesEliminar = document.querySelectorAll('.btn-eliminar');
  botonesEliminar.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('¿Desea eliminar esta transacción de cuenta?')) return;

      const payload = { accion: 'eliminar', id_transac_cta: id };

      try {
        const res = await fetch(`${API_BASE}/transaccta.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
          throw new Error(respuesta.mensaje || 'Error al eliminar transacción de cuenta');
        }
        alert(respuesta.mensaje || 'Transacción de cuenta eliminada correctamente');
        cargarTransacCta();
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarTransacCta();
});
