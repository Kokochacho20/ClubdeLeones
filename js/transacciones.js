const API_BASE = './api';

const formTransaccion = document.getElementById('form-transaccion');
const tbodyTransacciones = document.getElementById('tbody-transacciones');

// listado transacciones
async function cargarTransacciones() {
  try {
    const res = await fetch(`${API_BASE}/transacciones.php`);
    if (!res.ok) throw new Error('Error al cargar transacciones');
    const transacciones = await res.json();

    tbodyTransacciones.innerHTML = '';
    transacciones.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.ID_TRANSACCION}</td>
        <td>${t.ID_ACTIV_SOC}</td>
        <td>${t.FEC_TRANSACCION}</td>
        <td>${t.ID_TIP_PAGO}</td>
        <td>${t.MES_PAGO}</td>
        <td>${t.AN_PAGO}</td>
        <td>${t.MONEDA_TRANSAC}</td>
        <td>${t.MONTO_COLONES}</td>
        <td>${t.MONTO_DOLARES ?? ''}</td>
        <td>${t.ID_TIP_CAMBIO}</td>
        <td>
          <button class="btn btn-sm btn-amarillo btn-editar" data-id="${t.ID_TRANSACCION}">Editar</button>
          <button class="btn btn-sm btn-danger btn-eliminar" data-id="${t.ID_TRANSACCION}">Eliminar</button>
        </td>
      `;
      tbodyTransacciones.appendChild(tr);
    });
    asignarEventosAcciones();
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar las transacciones');
  }
}

// CRUD crear transacción
async function crearTransaccion(e) {
  e.preventDefault();
  const id_activ_soc = document.getElementById('id_activ_soc').value.trim();
  const fec_transaccion = document.getElementById('fec_transaccion').value.trim();
  const id_tip_pago = document.getElementById('id_tip_pago').value.trim();
  const mes_pago = document.getElementById('mes_pago').value.trim();
  const an_pago = document.getElementById('an_pago').value.trim();
  const moneda_transac = document.getElementById('moneda_transac').value.trim();
  const monto_colones = document.getElementById('monto_colones').value.trim();
  const monto_dolares = document.getElementById('monto_dolares').value.trim();
  const id_tip_cambio = document.getElementById('id_tip_cambio').value.trim();

  if (!id_activ_soc || !fec_transaccion || !id_tip_pago || !mes_pago || !an_pago || !moneda_transac || !monto_colones || !id_tip_cambio) {
    alert('Complete todos los campos obligatorios');
    return;
  }

  const payload = { 
    accion: 'crear', 
    id_activ_soc, 
    fec_transaccion, 
    id_tip_pago, 
    mes_pago, 
    an_pago, 
    moneda_transac, 
    monto_colones, 
    monto_dolares, 
    id_tip_cambio 
  };

  try {
    const res = await fetch(`${API_BASE}/transacciones.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const respuesta = await res.json();
    if (!res.ok || respuesta.ok === false) {
      throw new Error(respuesta.mensaje || 'Error al crear transacción');
    }
    alert(respuesta.mensaje || 'Transacción creada correctamente');
    formTransaccion.reset();
    cargarTransacciones();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}
formTransaccion.addEventListener('submit', crearTransaccion);

// CRUD eliminar transacción
function asignarEventosAcciones() {
  const botonesEliminar = document.querySelectorAll('.btn-eliminar');
  botonesEliminar.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('¿Desea eliminar esta transacción?')) return;

      const payload = { accion: 'eliminar', id_transaccion: id };

      try {
        const res = await fetch(`${API_BASE}/transacciones.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
          throw new Error(respuesta.mensaje || 'Error al eliminar transacción');
        }
        alert(respuesta.mensaje || 'Transacción eliminada correctamente');
        cargarTransacciones();
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarTransacciones();
});
