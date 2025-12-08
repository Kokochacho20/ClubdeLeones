const API_PAGO = "http://localhost/ClubdeLeones/api/TiposDePago.php";

const API_BASE = './api';

const formTipoPago = document.getElementById('form-tipopago');
const tbodyTipoPago = document.getElementById('tbody-tipopago');

// listado tipo de pago
async function cargarTipoPago() {
  try {
    const res = await fetch(`${API_BASE}/tipopago.php`);
    if (!res.ok) throw new Error('Error al cargar tipos de pago');
    const tipos = await res.json();

    tbodyTipoPago.innerHTML = '';
    tipos.forEach(tp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${tp.id_tip_pago}</td>
        <td>${tp.nombre_tip_pago}</td>
        <td>${tp.periodicidad}</td>
        <td>${tp.tipo}</td>
        <td>${tp.moneda}</td>
        <td>
          <button class="btn btn-sm btn-amarillo btn-editar" data-id="${tp.id_tip_pago}">Editar</button>
          <button class="btn btn-sm btn-danger btn-eliminar" data-id="${tp.id_tip_pago}">Eliminar</button>
        </td>
      `;
      tbodyTipoPago.appendChild(tr);
    });
    asignarEventosAcciones();
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar los tipos de pago');
  }
}

// CRUD crear tipo de pago
async function crearTipoPago(e) {
  e.preventDefault();
  const nombre_tip_pago = document.getElementById('nombre_tip_pago').value.trim();
  const periodicidad = document.getElementById('periodicidad').value;
  const tipo = document.getElementById('tipo').value;
  const moneda = document.getElementById('moneda').value;

  if (!nombre_tip_pago || !periodicidad || !tipo || !moneda) {
    alert('Complete todos los campos');
    return;
  }

  const payload = { 
    accion: 'crear', 
    nombre_tip_pago, 
    periodicidad, 
    tipo, 
    moneda 
  };

  try {
    const res = await fetch(`${API_BASE}/tipopago.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const respuesta = await res.json();
    if (!res.ok || respuesta.ok === false) {
      throw new Error(respuesta.mensaje || 'Error al crear tipo de pago');
    }
    alert(respuesta.mensaje || 'Tipo de pago creado correctamente');
    formTipoPago.reset();
    cargarTipoPago();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}
formTipoPago.addEventListener('submit', crearTipoPago);

// CRUD eliminar tipo de pago
function asignarEventosAcciones() {
  const botonesEliminar = document.querySelectorAll('.btn-eliminar');
  botonesEliminar.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('¿Desea eliminar este tipo de pago?')) return;

      const payload = { accion: 'eliminar', id_tip_pago: id };
      try {
        const res = await fetch(`${API_BASE}/tipopago.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
          throw new Error(respuesta.mensaje || 'Error al eliminar tipo de pago');
        }
        alert(respuesta.mensaje || 'Tipo de pago eliminado correctamente');
        cargarTipoPago();
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarTipoPago();
});
