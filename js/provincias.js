const API_BASE = '../api';

const formProvincia = document.getElementById('form-provincia');
const codProvinciaInput = document.getElementById('cod_provincia');
const nombreProvinciaInput = document.getElementById('nombre_provincia');
const tbodyProvincias = document.getElementById('tbody-provincias');
const botonGuardar = formProvincia.querySelector("button[type='submit']");

formProvincia.addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombre_provincia = nombreProvinciaInput.value.trim();
    const cod_provincia = codProvinciaInput.value.trim(); // hidden

    if (!nombre_provincia) {
        alert('Complete el nombre de la provincia');
        return;
    }

    const payload = cod_provincia
        ? {
            accion: 'actualizar',
            cod_provincia,
            nombre_provincia
        }
        : {
            accion: 'crear',
            nombre_provincia
        };

    try {
        const res = await fetch(`${API_BASE}/provincias.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();

        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al guardar provincia');
        }
        alert(respuesta.mensaje || (cod_provincia ? 'Provincia actualizada' : 'Provincia creada'));
        codProvinciaInput.value = '';
        nombreProvinciaInput.value = '';
        botonGuardar.textContent = 'Guardar';

        cargarProvincias();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});

// cargar las provincias  
async function cargarProvincias() {
    try {
        const res = await fetch(`${API_BASE}/provincias.php`);
        if (!res.ok) throw new Error('Error al cargar provincias');

        const provincias = await res.json();

        tbodyProvincias.innerHTML = '';

        provincias.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.COD_PROVINCIA}</td>
                <td>${p.NOMBRE_PROVINCIA}</td>
                <td>
                    <button class="btn btn-sm btn-amarillo btn-editar" data-id="${p.COD_PROVINCIA}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${p.COD_PROVINCIA}">Eliminar</button>
                </td>
            `;
            tbodyProvincias.appendChild(tr);
        });

        asignarEventosAcciones();
    } catch (err) {
        console.error(err);
        alert('No se pudo cargar el listado de provincias');
    }
}





//CRUD crear provincia
async function crearProvincia(e) {
    e.preventDefault();

    const nombre_provincia = document.getElementById('nombre_provincia').value.trim();

    if (!nombre_provincia) {
        alert('Complete el nombre de la provincia');
        return;
    }

    const payload = {
        accion: 'crear',
        nombre_provincia
    };

    try {
        const res = await fetch(`${API_BASE}/provincias.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al crear provincia');
        }

        alert(respuesta.mensaje || 'Provincia creada correctamente');
        formProvincia.reset();
        cargarProvincias();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}


function asignarEventosAcciones() {
    //crud EDITAR
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const fila = btn.closest('tr');
            const nombre = fila.children[1].textContent.trim();

            // ponemos el formulario en modo edición
            codProvinciaInput.value = id;
            nombreProvinciaInput.value = nombre;
            botonGuardar.textContent = 'Actualizar';
        });
    });

    //crud eliminar
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');

            if (!confirm('¿Desea eliminar esta provincia?')) return;

            const payload = {
                accion: 'eliminar',
                cod_provincia: id
            };

            try {
                const res = await fetch(`${API_BASE}/provincias.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const respuesta = await res.json();

                if (!res.ok || respuesta.ok === false) {
                    throw new Error(respuesta.mensaje || 'Error al eliminar provincia');
                }

                alert(respuesta.mensaje || 'Provincia eliminada correctamente');
                cargarProvincias();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    cargarProvincias();
});
