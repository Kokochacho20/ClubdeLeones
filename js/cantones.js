const API_BASE = '../api';

const provinciaSelectCanton = document.getElementById('id_provincia');
const formCanton = document.getElementById('form-canton');
const tbodyCantones = document.getElementById('tbody-cantones');

async function cargarProvinciasCantones() {
    try {
        const res = await fetch(`${API_BASE}/provincias.php`);
        if (!res.ok) throw new Error('Error al cargar provincias');

        const provincias = await res.json();
        provinciaSelectCanton.innerHTML =
            '<option value="" selected disabled>Seleccione una Provincia...</option>';

        provincias.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.COD_PROVINCIA;
            opt.textContent = p.NOMBRE_PROVINCIA;
            provinciaSelectCanton.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar las provincias');
    }
}

async function cargarCantonesTabla() {
    try {
        const res = await fetch(`${API_BASE}/cantones.php`);
        if (!res.ok) throw new Error('Error al cargar cantones');

        const cantones = await res.json();
        tbodyCantones.innerHTML = '';

        if (!cantones.length) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" class="text-center">No hay cantones registrados</td>';
            tbodyCantones.appendChild(tr);
            return;
        }

        cantones.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${c.COD_CANTON}</td>
        <td>${c.COD_PROVINCIA}</td>
        <td>${c.NOMBRE_CANTON}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${c.COD_CANTON}">
            Eliminar
          </button>
        </td>
      `;
            tbodyCantones.appendChild(tr);
        });

        asignarEventosEliminarCantones();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

async function crearCanton(e) {
    e.preventDefault();

    const codProvincia = provinciaSelectCanton.value;
    const nombreCanton = document.getElementById('nombre_canton').value.trim();

    if (!codProvincia || !nombreCanton) {
        alert('Debe seleccionar una provincia y digitar el nombre del cantón');
        return;
    }

    const payload = {
        accion: 'crear',
        cod_provincia: codProvincia,
        nombre_canton: nombreCanton
    };

    try {
        const res = await fetch(`${API_BASE}/cantones.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
            throw new Error(data.mensaje || 'Error al crear el cantón');
        }

        alert(data.mensaje || 'Cantón creado correctamente');
        formCanton.reset();
        cargarCantonesTabla();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function asignarEventosEliminarCantones() {
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('¿Desea eliminar este cantón?')) return;

            const payload = {
                accion: 'eliminar',
                cod_canton: id
            };

            try {
                const res = await fetch(`${API_BASE}/cantones.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (!res.ok || !data.ok) {
                    throw new Error(data.mensaje || 'Error al eliminar el cantón');
                }

                alert(data.mensaje || 'Cantón eliminado correctamente');
                cargarCantonesTabla();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!formCanton || !tbodyCantones) return;
    cargarProvinciasCantones();
    cargarCantonesTabla();
    formCanton.addEventListener('submit', crearCanton);
});