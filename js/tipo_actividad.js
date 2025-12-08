const API_BASE = '../api';

const formTipoActividad = document.getElementById('form-tipo-actividad');
const tbodyTiposActividad = document.getElementById('tbody-tipo-actividad');
const inputId = document.getElementById('id_tip_actividad');
const inputNombre = document.getElementById('nombre_tip_actividad');
const selectTipo = document.getElementById('tipo_actividad');
const botonGuardar = formTipoActividad.querySelector("button[type='submit']");

document.addEventListener('DOMContentLoaded', () => {
    cargarTiposActividad();
});

// listado tipos de actividad
async function cargarTiposActividad() {
    try {
        const res = await fetch(`${API_BASE}/tipo_actividad.php`);
        if (!res.ok) throw new Error('Error al cargar tipos de actividad');
        const tipos = await res.json();
        tbodyTiposActividad.innerHTML = '';

        tipos.forEach(t => {
            const tr = document.createElement('tr');

            const id = t.ID_TIP_ACTIVIDAD;
            const nombre = t.NOMBRE_TIP_ACTIVIDAD;
            const tipo = t.TIPO_ACTIVIDAD;

            let tipoTexto = '';
            if (tipo === 'I') tipoTexto = 'Ingreso';
            else if (tipo === 'C') tipoTexto = 'Cuota';
            else if (tipo === 'G') tipoTexto = 'Gasto/Egreso';
            else tipoTexto = tipo || '';

            tr.innerHTML = `
                <td>${id}</td>
                <td>${nombre}</td>
                <td>${tipoTexto}</td>
                <td>
                    <button 
                        class="btn btn-sm btn-amarillo btn-editar"
                        data-id="${id}"
                        data-nombre="${nombre}"
                        data-tipo="${tipo}"
                    >Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${id}">Eliminar</button>
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

// CREAR / ACTUALIZAR tipo de actividad
async function guardarTipoActividad(e) {
    e.preventDefault();

    const id = inputId.value.trim();
    const nombre = inputNombre.value.trim();
    const tipo = selectTipo.value;

    if (!nombre || !tipo) {
        alert('Complete todos los campos');
        return;
    }

    const accion = id ? 'actualizar' : 'crear';

    const payload = {
        accion,
        nombre_tip_actividad: nombre,
        tipo_actividad: tipo
    };

    if (id) {
        payload.id_tip_actividad = id;
    }

    try {
        const res = await fetch(`${API_BASE}/tipo_actividad.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const raw = await res.text();
        let respuesta;

        try {
            respuesta = JSON.parse(raw);
        } catch (e) {
            console.error('La respuesta del servidor NO es JSON. Texto recibido:', raw);
            throw new Error('Respuesta no válida del servidor (no es JSON). Revisa la consola del navegador.');
        }

        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al guardar tipo de actividad');
        }

        alert(
            respuesta.mensaje ||
            (id ? 'Tipo de actividad actualizado correctamente'
                : 'Tipo de actividad creado correctamente')
        );

        // Reset form
        formTipoActividad.reset();
        inputId.value = '';
        botonGuardar.textContent = 'Guardar Tipo de Actividad';

        cargarTiposActividad();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

formTipoActividad.addEventListener('submit', guardarTipoActividad);

// EDITAR + ELIMINAR
function asignarEventosAcciones() {
    // EDITAR
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const nombre = btn.getAttribute('data-nombre');
            const tipo = btn.getAttribute('data-tipo');

            inputId.value = id;
            inputNombre.value = nombre;
            selectTipo.value = tipo;

            botonGuardar.textContent = 'Actualizar Tipo de Actividad';

            formTipoActividad.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ELIMINAR
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
