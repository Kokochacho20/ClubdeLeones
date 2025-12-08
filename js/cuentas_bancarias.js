const API_BASE = '../api';

const formCuenta = document.getElementById('form-cuenta');
const tbodyCuentas = document.getElementById('tbody-cuentas');

const inputIdCuenta = document.getElementById('id_cuenta_bco');
const inputNombre = document.getElementById('nombre_cuenta_bco');
const selectBanco = document.getElementById('id_banco');
const selectMoneda = document.getElementById('moneda_cuenta_bco');
const inputFecCorte = document.getElementById('fec_corte');
const inputSaldoCorte = document.getElementById('saldo_corte');
const botonGuardar = formCuenta.querySelector("button[type='submit']");

document.addEventListener('DOMContentLoaded', () => {
    cargarBancosSelect();
    cargarCuentas();
    formCuenta.addEventListener('submit', guardarCuenta);
});

// Cargar bancos en el select
async function cargarBancosSelect() {
    try {
        const res = await fetch(`${API_BASE}/bancos.php`);
        if (!res.ok) throw new Error('Error al cargar bancos');

        const bancos = await res.json();
        selectBanco.innerHTML = '<option value="">Seleccione...</option>';

        bancos.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.ID_BANCO;
            opt.textContent = b.NOMBRE_BANCO;
            selectBanco.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar los bancos');
        selectBanco.innerHTML = '<option value="">Error al cargar bancos</option>';
    }
}

// Listado de cuentas
async function cargarCuentas() {
    try {
        const res = await fetch(`${API_BASE}/cuentas_bancarias.php`);
        if (!res.ok) throw new Error('Error al cargar cuentas bancarias');

        const cuentas = await res.json();
        tbodyCuentas.innerHTML = '';

        cuentas.forEach(c => {
            const tr = document.createElement('tr');

            const id = c.ID_CUENTA_BCO;
            const nombre = c.NOMBRE_CUENTA_BCO;
            const idBanco = c.ID_BANCO;
            const nomBanco = c.NOMBRE_BANCO;
            const moneda = c.MONEDA_CUENTA_BCO;
            const fec = c.FEC_CORTE ?? '';
            const saldo = c.SALDO_CORTE ?? '';

            tr.innerHTML = `
                <td>${id}</td>
                <td>${nombre}</td>
                <td>${nomBanco}</td>
                <td>${moneda}</td>
                <td>${fec}</td>
                <td>${saldo}</td>
                <td>
                    <button 
                        class="btn btn-sm btn-amarillo btn-editar"
                        data-id="${id}"
                        data-nombre="${nombre}"
                        data-id-banco="${idBanco}"
                        data-moneda="${moneda}"
                        data-fec="${fec}"
                        data-saldo="${saldo}"
                    >Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${id}">Eliminar</button>
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

// Crear / Actualizar cuenta
async function guardarCuenta(e) {
    e.preventDefault();

    const id_cuenta_bco = inputIdCuenta.value.trim();
    const nombre_cuenta_bco = inputNombre.value.trim();
    const id_banco = selectBanco.value;
    const moneda_cuenta_bco = selectMoneda.value;
    const fec_corte = inputFecCorte.value;
    const saldo_corte = inputSaldoCorte.value;

    if (!nombre_cuenta_bco || !id_banco || !moneda_cuenta_bco) {
        alert('Complete los campos obligatorios: Nombre, Banco y Moneda');
        return;
    }

    const accion = id_cuenta_bco ? 'actualizar' : 'crear';

    const payload = {
        accion,
        nombre_cuenta_bco,
        id_banco,
        moneda_cuenta_bco,
        fec_corte,
        saldo_corte
    };

    if (id_cuenta_bco) {
        payload.id_cuenta_bco = id_cuenta_bco;
    }

    try {
        const res = await fetch(`${API_BASE}/cuentas_bancarias.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al guardar cuenta bancaria');
        }

        alert(
            respuesta.mensaje ||
            (id_cuenta_bco ? 'Cuenta bancaria actualizada correctamente'
                : 'Cuenta bancaria creada correctamente')
        );

        formCuenta.reset();
        inputIdCuenta.value = '';
        botonGuardar.textContent = 'Guardar Cuenta Bancaria';

        cargarCuentas();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

// Editar + Eliminar
function asignarEventosAcciones() {
    // EDITAR
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const nombre = btn.getAttribute('data-nombre');
            const idBanco = btn.getAttribute('data-id-banco');
            const moneda = btn.getAttribute('data-moneda');
            const fec = btn.getAttribute('data-fec');
            const saldo = btn.getAttribute('data-saldo');

            inputIdCuenta.value = id;
            inputNombre.value = nombre;
            selectBanco.value = idBanco;
            selectMoneda.value = moneda;
            inputFecCorte.value = fec ? fec.substring(0, 10) : '';
            inputSaldoCorte.value = saldo;

            botonGuardar.textContent = 'Actualizar Cuenta Bancaria';

            formCuenta.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ELIMINAR
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
