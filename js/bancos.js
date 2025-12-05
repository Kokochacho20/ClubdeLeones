const API_BASE = './api'; // Ajustar si los HTML tienen su propia carpeta

const formBanco = document.getElementById('form-banco');
const tbodyBancos = document.getElementById('tbody-bancos');

// listado bancos
async function cargarBancos() {
    try {
        const res = await fetch(`${API_BASE}/bancos.php`);
        if (!res.ok) throw new Error('Error al cargar bancos');
        const bancos = await res.json();
        tbodyBancos.innerHTML = '';

        bancos.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${b.ID_BANCO}</td>
                <td>${b.NOMBRE_BANCO}</td>
                <td>${b.TEL_BANCO1}</td>
                <td>${b.TEL_BANCO2 ?? ''}</td>
                <td>${b.CONTACTO_BANCO1}</td>
                <td>${b.CONTACTO_BANCO2 ?? ''}</td>
                <td>
                    <button class="btn btn-sm btn-amarillo btn-editar" data-id="${b.ID_BANCO}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${b.ID_BANCO}">Eliminar</button>
                </td>
            `;
            tbodyBancos.appendChild(tr);
        });

        asignarEventosAcciones();
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar los bancos');
    }
}

// CRUD crear banco
async function crearBanco(e) {
    e.preventDefault();
    const nombre_banco    = document.getElementById('nombre_banco').value.trim();
    const tel_banco1      = document.getElementById('tel_banco1').value.trim();
    const tel_banco2      = document.getElementById('tel_banco2').value.trim();
    const contacto_banco1 = document.getElementById('contacto_banco1').value.trim();
    const contacto_banco2 = document.getElementById('contacto_banco2').value.trim();

    if (!nombre_banco || !tel_banco1 || !contacto_banco1) {
        alert('Complete los campos obligatorios: Nombre, Teléfono Principal y Contacto Principal');
        return;
    }

    const payload = {
        accion: 'crear',
        nombre_banco,
        tel_banco1,
        tel_banco2,
        contacto_banco1,
        contacto_banco2
    };

    try {
        const res = await fetch(`${API_BASE}/bancos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al crear banco');
        }

        alert(respuesta.mensaje || 'Banco creado correctamente');
        formBanco.reset();
        cargarBancos();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

formBanco.addEventListener('submit', crearBanco);

// CRUD eliminar banco
function asignarEventosAcciones() {
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('¿Desea eliminar este banco?')) return;

            const payload = {
                accion: 'eliminar',
                id_banco: id
            };

            try {
                const res = await fetch(`${API_BASE}/bancos.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const respuesta = await res.json();
                if (!res.ok || respuesta.ok === false) {
                    throw new Error(respuesta.mensaje || 'Error al eliminar banco');
                }

                alert(respuesta.mensaje || 'Banco eliminado correctamente');
                cargarBancos();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarBancos();
});
