const API_BASE = './api'; // Ajustar si los HTML tienen su propia carpeta

const formCuenta = document.getElementById('form-cuenta');
const tbodyCuentas = document.getElementById('tbody-cuentas');

// listado cuentas bancarias
async function cargarCuentas() {
    try {
        const res = await fetch(`${API_BASE}/cuentas_bancarias.php`);
        if (!res.ok) throw new Error('Error al cargar cuentas bancarias');
        const cuentas = await res.json();
        tbodyCuentas.innerHTML = '';

        cuentas.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.ID_CUENTA_BCO}</td>
                <td>${c.NOMBRE_CUENTA_BCO}</td>
                <td>${c.ID_BANCO}</td>
                <td>${c.MONEDA_CUENTA_BCO}</td>
                <td>${c.FEC_CORTE ?? ''}</td>
                <td>${c.SALDO_CORTE ?? ''}</td>
                <td>
                    <button class="btn btn-sm btn-amarillo btn-editar" data-id="${c.ID_CUENTA_BCO}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${c.ID_CUENTA_BCO}">Eliminar</button>
                </td>
            `;
            tbodyCuentas.appendChild(tr);
        });

        asignarEventosAcciones();
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar las cuentas bancarias');
    }
}

// CRUD crear cuenta bancaria
async function crearCuenta(e) {
    e.preventDefault();
    const nombre_cuenta_bco = document.getElementById('nombre_cuenta_bco').value.trim();
    const id_banco          = document.getElementById('id_banco').value.trim();
    const moneda_cuenta_bco = document.getElementById('moneda_cuenta_bco').value.trim();
    const fec_corte         = document.getElementById('fec_corte').value.trim();
    const saldo_corte       = document.getElementById('saldo_corte').value.trim();

    if (!nombre_cuenta_bco || !id_banco || !moneda_cuenta_bco) {
        alert('Complete los campos obligatorios: Nombre, Banco y Moneda');
        return;
    }

    const payload = {
        accion: 'crear',
        nombre_cuenta_bco,
        id_banco,
        moneda_cuenta_bco,
        fec_corte,
        saldo_corte
    };

    try {
        const res = await fetch(`${API_BASE}/cuentas_bancarias.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al crear cuenta bancaria');
        }

        alert(respuesta.mensaje || 'Cuenta bancaria creada correctamente');
        formCuenta.reset();
        cargarCuentas();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

formCuenta.addEventListener('submit', crearCuenta);

// CRUD eliminar cuenta bancaria
function asignarEventosAcciones() {
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('¿Desea eliminar esta cuenta bancaria?')) return;

            const payload = {
                accion: 'eliminar',
                id_cuenta_bco: id
            };

            try {
                const res = await fetch(`${API_BASE}/cuentas_bancarias.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const respuesta = await res.json();
                if (!res.ok || respuesta.ok === false) {
                    throw new Error(respuesta.mensaje || 'Error al eliminar cuenta bancaria');
                }

                alert(respuesta.mensaje || 'Cuenta bancaria eliminada correctamente');
                cargarCuentas();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCuentas();
});
