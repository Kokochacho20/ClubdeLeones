const API_BASE = '../api'; // se tiene que ajustar la ruta según tu estructura real

const provinciaSelect = document.getElementById('id_provincia');
const cantonSelect = document.getElementById('id_canton');
const formDistrito = document.getElementById('form-distrito');
const tbodyDistritos = document.getElementById('tbody-distritos');

// ========== PROVINCIAS ==========

async function cargarProvincias() {
    try {
        const res = await fetch(`${API_BASE}/provincias.php`);
        if (!res.ok) throw new Error('Error al cargar provincias');

        const provincias = await res.json();

        provinciaSelect.innerHTML = '<option value="" selected disabled>Seleccione...</option>';

        provincias.forEach(p => {
            // Esperado: p.COD_PROVINCIA, p.NOMBRE_PROVINCIA
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

// ========== CANTONES ==========

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
            // Esperado: c.COD_CANTON, c.NOMBRE_CANTON
            const opt = document.createElement('option');
            opt.value = c.COD_CANTON;
            opt.textContent = c.NOMBRE_CANTON;
            cantonSelect.appendChild(opt);
        });

        cantonSelect.disabled = false;
    } catch (err) {
        console.error(err);
        cantonSelect.innerHTML = '<option value="" selected disabled>Error al cargar</option>';
        alert('No se pudieron cargar los cantones');
    }
}

provinciaSelect.addEventListener('change', () => {
    const codProvincia = provinciaSelect.value;
    cargarCantones(codProvincia);
});

// ========== DISTRITOS: LISTAR ==========

async function cargarDistritos() {
    try {
        const res = await fetch(`${API_BASE}/distritos.php`);
        if (!res.ok) throw new Error('Error al cargar distritos');

        const distritos = await res.json();

        tbodyDistritos.innerHTML = '';

        distritos.forEach(d => {
            // Esperado: d.COD_DISTRITO, d.NOMBRE_DISTRITO, d.NOMBRE_CANTON, d.COD_POSTAL
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${d.COD_DISTRITO}</td>
                <td>${d.NOMBRE_CANTON}</td>
                <td>${d.NOMBRE_DISTRITO}</td>
                <td>${d.COD_POSTAL ?? ''}</td>
                <td>
                    <button class="btn btn-sm btn-amarillo btn-editar" data-id="${d.COD_DISTRITO}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${d.COD_DISTRITO}">Eliminar</button>
                </td>
            `;

            tbodyDistritos.appendChild(tr);
        });

        // asignar eventos de eliminar (editar lo puedes completar luego)
        asignarEventosAcciones();
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar los distritos');
    }
}

// ========== DISTRITOS: CREAR ==========

async function crearDistrito(e) {
    e.preventDefault();

    const cod_provincia = provinciaSelect.value;
    const cod_canton = cantonSelect.value;
    const nombre_distrito = document.getElementById('nombre_distrito').value.trim();

    if (!cod_provincia || !cod_canton || !nombre_distrito) {
        alert('Complete todos los campos');
        return;
    }

    const payload = {
        accion: 'crear',
        cod_provincia,
        cod_canton,
        nombre_distrito
    };

    try {
        const res = await fetch(`${API_BASE}/distritos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();

        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al crear distrito');
        }

        alert(respuesta.mensaje || 'Distrito creado correctamente');

        formDistrito.reset();
        cantonSelect.disabled = true;
        cantonSelect.innerHTML = '<option value="" selected>Seleccione una Provincia primero</option>';

        cargarDistritos();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

formDistrito.addEventListener('submit', crearDistrito);

// ========== DISTRITOS: ELIMINAR (básico) ==========

function asignarEventosAcciones() {
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

    // Aquí podrías agregar eventos para .btn-editar si quieres modo edición
}

// ========== INICIALIZACIÓN ==========

document.addEventListener('DOMContentLoaded', () => {
    cargarProvincias();
    cargarDistritos();
});
