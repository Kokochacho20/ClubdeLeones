const API_BASE = './api'; 
const formTipoCambio = document.getElementById('form-tipocambio');
const tbodyTipoCambio = document.getElementById('tbody-tipocambio');

// listado tipo de cambio
async function cargarTipoCambio() {
  try {
    const res = await fetch(`${API_BASE}/tipocambio.php`);
    if (!res.ok) throw new Error('Error al cargar tipo de cambio');
    const tipos = await res.json();

    tbodyTipoCambio.innerHTML = '';
    tipos.forEach(tc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${tc.ID_TIP_CAMBIO}</td>
        <td>${tc.FEC_TIP_CAMBIO}</td>
        <td>${tc.TC_COMPRA}</td>
        <td>${tc.TC_VENTA}</td>
        <td>
          <button class="btn btn-sm btn-amarillo btn-editar" data-id="${tc.ID_TIP_CAMBIO}">Editar</button>
          <button class="btn btn-sm btn-danger btn-eliminar" data-id="${tc.ID_TIP_CAMBIO}">Eliminar</button>
        </td>
      `;
      tbodyTipoCambio.appendChild(tr);
    });
    asignarEventosAcciones();
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar los tipos de cambio');
  }
}

// CRUD crear tipo de cambio
async function crearTipoCambio(e) {
  e.preventDefault();
  const fec_tip_cambio = document.getElementById('fec_tip_cambio').value.trim();
  const tc_compra = document.getElementById('tc_compra').value.trim();
  const tc_venta = document.getElementById('tc_venta').value.trim();

  if (!fec_tip_cambio || !tc_compra || !tc_venta) {
    alert('Complete todos los campos');
    return;
  }

  const payload = { 
    accion: 'crear', 
    fec_tip_cambio, 
    tc_compra, 
    tc_venta 
  };

  try {
    const res = await fetch(`${API_BASE}/tipocambio.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const respuesta = await res.json();
    if (!res.ok || respuesta.ok === false) {
      throw new Error(respuesta.mensaje || 'Error al crear tipo de cambio');
    }
    alert(respuesta.mensaje || 'Tipo de cambio creado correctamente');
    formTipoCambio.reset();
    cargarTipoCambio();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}
formTipoCambio.addEventListener('submit', crearTipoCambio);

// CRUD eliminar tipo de cambio
function asignarEventosAcciones() {
  const botonesEliminar = document.querySelectorAll('.btn-eliminar');
  botonesEliminar.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('¿Desea eliminar este tipo de cambio?')) return;

      const payload = { accion: 'eliminar', id_tip_cambio: id };

      try {
        const res = await fetch(`${API_BASE}/tipocambio.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
          throw new Error(respuesta.mensaje || 'Error al eliminar tipo de cambio');
        }
        alert(respuesta.mensaje || 'Tipo de cambio eliminado correctamente');
        cargarTipoCambio();
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarTipoCambio();
});
