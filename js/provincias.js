const API_BASE = '../api';

const codProvinciaInput = document.getElementById('cod_provincia');
const formProvincia = document.getElementById('form-provincia');
const tbodyProvincias = document.getElementById('tbody-provincias');


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
    const cod_provincia = codProvinciaInput.value;
    const nombre_provincia = document.getElementById('nombre_provincia').value.trim();

    if (!cod_provincia || !nombre_provincia) {
        alert('Complete todos los campos');
        return;
    }

    const payload = {
        accion: 'crear',
        cod_provincia,
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

formProvincia.addEventListener('submit', crearProvincia);

//CRUD delete provincia
function asignarEventosAcciones() {
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('¿Desea eliminar esta povincia?')) return;
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
