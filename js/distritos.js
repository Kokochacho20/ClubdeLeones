const API_BASE = '../api';

const formDistrito        = document.getElementById('form-distrito');
const codDistritoInput    = document.getElementById('cod_distrito');
const codProvinciaSelect  = document.getElementById('cod_provincia');
const codCantonSelect     = document.getElementById('cod_canton');
const nombreDistritoInput = document.getElementById('nombre_distrito');
const tbodyDistritos      = document.getElementById('tbody-distritos');
const botonGuardar        = formDistrito.querySelector("button[type='submit']");

let cantonesCache = [];

document.addEventListener('DOMContentLoaded', () => {
    codCantonSelect.disabled = true;
    codCantonSelect.innerHTML =
        '<option value="">Seleccione una Provincia primero</option>';

    cargarProvincias();
    cargarCantones();
    cargarDistritos();
});

async function cargarProvincias() {
    try {
        const res = await fetch(`${API_BASE}/provincias.php`);
        const provincias = await res.json();

        codProvinciaSelect.innerHTML =
            '<option value="" selected disabled>Seleccione una provincia...</option>';

        provincias.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.COD_PROVINCIA;
            opt.textContent = p.NOMBRE_PROVINCIA;
            codProvinciaSelect.appendChild(opt);
        });

    } catch {
        codProvinciaSelect.innerHTML =
            '<option value="">Error al cargar provincias</option>';
    }
}

codProvinciaSelect.addEventListener('change', () => {
    const codProv = codProvinciaSelect.value;
    if (codProv) {
        poblarCantonesPorProvincia(codProv);
    } else {
        codCantonSelect.innerHTML =
            '<option value="">Seleccione una Provincia primero</option>';
        codCantonSelect.disabled = true;
    }
});

async function cargarCantones() {
    try {
        const res = await fetch(`${API_BASE}/cantones.php`);
        const cantones = await res.json();
        cantonesCache = cantones;

    } catch {
        cantonesCache = [];
    }
}

function poblarCantonesPorProvincia(codProv) {
    if (!codProv) {
        codCantonSelect.disabled = true;
        codCantonSelect.innerHTML =
            '<option value="">Seleccione una Provincia primero</option>';
        return;
    }

    codCantonSelect.disabled = false;
    codCantonSelect.innerHTML =
        '<option value="" selected disabled>Seleccione un cantón...</option>';

    cantonesCache
        .filter(c => String(c.cod_provincia) === String(codProv))
        .forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.cod_canton;
            opt.textContent = c.nombre_canton;
            codCantonSelect.appendChild(opt);
        });
}

async function cargarDistritos() {
    try {
        const res = await fetch(`${API_BASE}/distritos.php`);
        const distritos = await res.json();
        tbodyDistritos.innerHTML = '';

        distritos.forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${d.COD_DISTRITO}</td>
                <td>${d.NOMBRE_CANTON}</td>
                <td>${d.NOMBRE_DISTRITO}</td>
                <td>
                    <button class="btn btn-sm btn-amarillo btn-editar"
                            data-id="${d.COD_DISTRITO}"
                            data-cod-canton="${d.COD_CANTON}"
                            data-cod-provincia="${d.COD_PROVINCIA}">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger btn-eliminar"
                            data-id="${d.COD_DISTRITO}">
                        Eliminar
                    </button>
                </td>
            `;
            tbodyDistritos.appendChild(tr);
        });

        asignarEventosAcciones();

    } catch {
    }
}

formDistrito.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cod_distrito    = codDistritoInput.value.trim();
    const cod_provincia   = codProvinciaSelect.value;
    const cod_canton      = codCantonSelect.value;
    const nombre_distrito = nombreDistritoInput.value.trim();

    if (!cod_provincia || !cod_canton || !nombre_distrito) {
        alert('Complete todos los campos');
        return;
    }

    const payload = cod_distrito
        ? {
            accion: 'actualizar',
            cod_distrito,
            cod_canton,
            nombre_distrito
        }
        : {
            accion: 'crear',
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

        alert(
            respuesta.mensaje ||
            (cod_distrito ? 'Distrito actualizado' : 'Distrito creado')
        );

        formDistrito.reset();
        codDistritoInput.value = '';
        codProvinciaSelect.value = '';
        codCantonSelect.disabled = true;
        codCantonSelect.innerHTML =
            '<option value="">Seleccione una Provincia primero</option>';
        botonGuardar.textContent = 'Guardar';

        cargarDistritos();

    } catch {
    }
});

function asignarEventosAcciones() {
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id        = btn.dataset.id;
            const codProv   = btn.dataset.codProvincia;
            const codCanton = btn.dataset.codCanton;
            const fila      = btn.closest('tr');
            const nombreDist = fila.children[2].textContent.trim();

            codDistritoInput.value    = id;
            nombreDistritoInput.value = nombreDist;
            botonGuardar.textContent  = 'Actualizar';

            codProvinciaSelect.value = codProv;
            poblarCantonesPorProvincia(codProv);
            codCantonSelect.value = codCanton;
        });
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (!confirm('¿Desea eliminar este distrito?')) return;

            const payload = {
                accion: 'eliminar',
                cod_distrito: id
            };

            try {
                await fetch(`${API_BASE}/distritos.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                cargarDistritos();

            } catch {
            }
        });
    });
}