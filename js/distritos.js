const API_BASE = '../api';

const provinciaSelect = document.getElementById('id_provincia');
const cantonSelect = document.getElementById('id_canton');
const formDistrito = document.getElementById('form-distrito');
const tbodyDistritos = document.getElementById('tbody-distritos');


// cargar las provincias para que distritos funcione 
async function cargarProvincias() {
    try {
        const res = await fetch(`${API_BASE}/provincias.php`);
        if (!res.ok) throw new Error('Error al cargar provincias');

        const provincias = await res.json();

        provinciaSelect.innerHTML = '<option value="" selected disabled>Seleccione...</option>';

        provincias.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.COD_PROVINCIA;
            opt.textContent = p.NOMBRE_PROVINCIA;
            provinciaSelect.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar las provincias');
    }
}

//cargar los cantones para que distritos funcione 
async function cargarCantones(codProvincia) {
    if (!codProvincia) return;

    cantonSelect.innerHTML = '<option value="" selected disabled>Cargando...</option>';
    cantonSelect.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/cantones.php?provincia=${encodeURIComponent(codProvincia)}`);
        if (!res.ok) throw new Error('Error al cargar cantones');
        const cantones = await res.json();
        cantonSelect.innerHTML = '<option value="" selected disabled>Seleccione...</option>';


        cantones.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.cod_canton;          // minúsculas
            opt.textContent = c.nombre_canton; // minúsculas
            cantonSelect.appendChild(opt);
        });


        cantonSelect.disabled = false;
    } catch (err) {
        console.error(err);
        cantonSelect.innerHTML = '<option value="" selected disabled>error al cargar</option>';
        alert('No se pudieron cargar loscantones');
    }
}
provinciaSelect.addEventListener('change', () => {
    const codProvincia = provinciaSelect.value;
    cargarCantones(codProvincia);
});

// listado distritos 
async function cargarDistritos() {
    try {
        const res = await fetch(`${API_BASE}/distritos.php`);
        if (!res.ok) throw new Error('Error al cargar distritos');
        const distritos = await res.json();
        tbodyDistritos.innerHTML = '';

        distritos.forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${d.COD_DISTRITO}</td>
        <td>${d.NOMBRE_CANTON || ''}</td>
        <td>${d.NOMBRE_DISTRITO}</td>
        <td>
            <button 
                class="btn btn-sm btn-amarillo btn-editar"
                data-id="${d.COD_DISTRITO}"
                data-provincia="${d.COD_PROVINCIA}"
                data-canton="${d.COD_CANTON}"
                data-nombre="${d.NOMBRE_DISTRITO}"
            >Editar</button>
            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${d.COD_DISTRITO}">Eliminar</button>
        </td>
    `;

            tbodyDistritos.appendChild(tr);
        });


        asignarEventosAcciones();
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar los distritos');
    }
}

//CRUD crear distrito
async function crearDistrito(e) {
    e.preventDefault();

    const cod_distrito = document.getElementById('cod_distrito').value;
    const cod_provincia = provinciaSelect.value;
    const cod_canton = cantonSelect.value;
    const nombre_distrito = document.getElementById('nombre_distrito').value.trim();

    if (!cod_provincia || !cod_canton || !nombre_distrito) {
        alert('Complete todos los campos');
        return;
    }

    // decidir acción según si estamos editando o creando
    const accion = cod_distrito ? 'actualizar' : 'crear';

    const payload = {
        accion,
        cod_provincia,
        cod_canton,
        nombre_distrito
    };

    if (cod_distrito) {
        payload.cod_distrito = cod_distrito;
    }

    try {
        const res = await fetch(`${API_BASE}/distritos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al guardar distrito');
        }

        alert(
            respuesta.mensaje ||
            (cod_distrito ? 'Distrito actualizado correctamente' : 'Distrito creado correctamente')
        );

        formDistrito.reset();
        document.getElementById('cod_distrito').value = '';
        cantonSelect.disabled = true;
        cantonSelect.innerHTML = '<option value="" selected>Seleccione una Provincia primero</option>';

        // devolver botón a "Guardar"
        const botonGuardar = formDistrito.querySelector("button[type='submit']");
        if (botonGuardar) botonGuardar.textContent = 'Guardar';

        cargarDistritos();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}


formDistrito.addEventListener('submit', crearDistrito);

//editar 
function asignarEventosAcciones() {
    // EDITAR
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const codProvincia = btn.getAttribute('data-provincia');
            const codCanton = btn.getAttribute('data-canton');
            const nombre = btn.getAttribute('data-nombre');

            // poner valores en el formulario
            document.getElementById('cod_distrito').value = id;
            provinciaSelect.value = codProvincia;
            document.getElementById('nombre_distrito').value = nombre;

            // cargar cantones de esa provincia y seleccionar el correcto
            await cargarCantones(codProvincia);
            cantonSelect.value = codCanton;

            // cambiar texto del botón
            const botonGuardar = formDistrito.querySelector("button[type='submit']");
            if (botonGuardar) botonGuardar.textContent = 'Actualizar';

            // hacer scroll al formulario
            formDistrito.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ELIMINAR
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('¿Desea eliminar este distrito?')) return;

            const payload = {
                accion: 'eliminar',
                cod_distrito: id
            };

            try {
                const res = await fetch(`${API_BASE}/distritos.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const respuesta = await res.json();

                if (!res.ok || respuesta.ok === false) {
                    throw new Error(respuesta.mensaje || 'Error al eliminar distrito');
                }

                alert(respuesta.mensaje || 'Distrito eliminado correctamente');
                cargarDistritos();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProvincias();
    cargarDistritos();
});
