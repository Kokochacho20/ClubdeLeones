const API_BASE = './api'; // Ajustar si los HTML tienen su propia carpeta

const formTipoActividad = document.getElementById('form-tipo-actividad');
const tbodyTiposActividad = document.getElementById('tbody-tipo-actividad');

// listado tipos de actividad
async function cargarTiposActividad() {
    try {
        const res = await fetch(`${API_BASE}/tipo_actividad.php`);
        if (!res.ok) throw new Error('Error al cargar tipos de actividad');
        const tipos = await res.json();
        tbodyTiposActividad.innerHTML = '';

        tipos.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.ID_TIP_ACTIVIDAD}</td>
                <td>${t.NOMBRE_TIP_ACTIVIDAD}</td>
                <td>${t.TIPO_ACTIVIDAD}</td>
                <td>
                    <button class="btn btn-sm btn-amarillo btn-editar" data-id="${t.ID_TIP_ACTIVIDAD}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${t.ID_TIP_ACTIVIDAD}">Eliminar</button>
                </td>
            `;
            tbodyTiposActividad.appendChild(tr);
        });

        asignarEventosAcciones();
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar los tipos de actividad');
    }
}

// CRUD crear tipo de actividad
async function crearTipoActividad(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre_tip_actividad').value.trim();
    const tipo   = document.getElementById('tipo_actividad').value.trim();

    if (!nombre || !tipo) {
        alert('Complete todos los campos');
        return;
    }

    const payload = {
        accion: 'crear',
        nombre_tip_actividad: nombre,
        tipo_actividad: tipo
    };

    try {
        const res = await fetch(`${API_BASE}/tipo_actividad.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al crear tipo de actividad');
        }

        alert(respuesta.mensaje || 'Tipo de actividad creado correctamente');
        formTipoActividad.reset();
        cargarTiposActividad();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

formTipoActividad.addEventListener('submit', crearTipoActividad);

// CRUD eliminar tipo de actividad
function asignarEventosAcciones() {
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('¿Desea eliminar este tipo de actividad?')) return;

            const payload = {
                accion: 'eliminar',
                id_tip_actividad: id
            };

            try {
                const res = await fetch(`${API_BASE}/tipo_actividad.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const respuesta = await res.json();
                if (!res.ok || respuesta.ok === false) {
                    throw new Error(respuesta.mensaje || 'Error al eliminar tipo de actividad');
                }

                alert(respuesta.mensaje || 'Tipo de actividad eliminado correctamente');
                cargarTiposActividad();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarTiposActividad();
});
