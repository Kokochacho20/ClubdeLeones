const API_BASE = '../api';

const formTransaccion = document.getElementById('form-transaccion');
const tbodyTransacciones = document.getElementById('tbody-transacciones');
const inputId = document.getElementById('id_transaccion');
const inputSocio = document.getElementById('id_activ_soc');
const inputFecha = document.getElementById('fec_transaccion');
const selectTipoPago = document.getElementById('id_tip_pago');
const inputMes = document.getElementById('mes_pago');
const inputAnio = document.getElementById('an_pago');
const selectMoneda = document.getElementById('moneda_transac');
const inputColones = document.getElementById('monto_colones');
const inputDolares = document.getElementById('monto_dolares');
const inputTipoCambio = document.getElementById('id_tip_cambio');
const botonGuardar = formTransaccion.querySelector("button[type='submit']");

document.addEventListener('DOMContentLoaded', () => {
    cargarTransacciones();
});

// LISTADO DE TRANSACCIONES
async function cargarTransacciones() {
    try {
        const res = await fetch(`${API_BASE}/transacciones.php`);
        if (!res.ok) throw new Error('Error al cargar transacciones');
        const transacciones = await res.json();
        tbodyTransacciones.innerHTML = '';

        transacciones.forEach(t => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${t.ID_TRANSACCION}</td>
                <td>${t.ID_ACTIV_SOC}</td>
                <td>${t.FEC_TRANSACCION}</td>
                <td>${t.ID_TIP_PAGO}</td>
                <td>${t.MES_PAGO}</td>
                <td>${t.AN_PAGO}</td>
                <td>${t.MONEDA_TRANSAC}</td>
                <td>${t.MONTO_COLONES}</td>
                <td>${t.MONTO_DOLARES || ''}</td>
                <td>${t.ID_TIP_CAMBIO}</td>
                <td>
                    <button 
                        class="btn btn-sm btn-amarillo btn-editar"
                        data-id="${t.ID_TRANSACCION}"
                        data-socio="${t.ID_ACTIV_SOC}"
                        data-fecha="${t.FEC_TRANSACCION}"
                        data-tip_pago="${t.ID_TIP_PAGO}"
                        data-mes="${t.MES_PAGO}"
                        data-anio="${t.AN_PAGO}"
                        data-moneda="${t.MONEDA_TRANSAC}"
                        data-colones="${t.MONTO_COLONES}"
                        data-dolares="${t.MONTO_DOLARES || ''}"
                        data-tip_cambio="${t.ID_TIP_CAMBIO}"
                    >Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${t.ID_TRANSACCION}">Eliminar</button>
                </td>
            `;
            tbodyTransacciones.appendChild(tr);
        });

        asignarEventosAcciones();
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar las transacciones');
    }
}

// CREAR / ACTUALIZAR TRANSACCION
async function guardarTransaccion(e) {
    e.preventDefault();

    const id = inputId.value.trim();
    const socio = inputSocio.value.trim();
    const fecha = inputFecha.value.trim();
    const tipPago = selectTipoPago.value;
    const mes = inputMes.value.trim();
    const anio = inputAnio.value.trim();
    const moneda = selectMoneda.value;
    const colones = inputColones.value.trim();
    const dolares = inputDolares.value.trim();
    const tipCambio = inputTipoCambio.value.trim();

    if (!socio || !fecha || !tipPago || !mes || !anio || !colones || !tipCambio) {
        alert('Complete todos los campos obligatorios');
        return;
    }

    const accion = id ? 'actualizar' : 'crear';

    const payload = {
        accion,
        id_activ_soc: socio,
        fec_transaccion: fecha,
        id_tip_pago: tipPago,
        mes_pago: mes,
        an_pago: anio,
        moneda_transac: moneda,
        monto_colones: colones,
        monto_dolares: dolares || null,
        id_tip_cambio: tipCambio
    };

    if (id) {
        payload.id_transaccion = id;
    }

    try {
        const res = await fetch(`${API_BASE}/transacciones.php`, {
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
            throw new Error(respuesta.mensaje || 'Error al guardar transacción');
        }

        alert(
            respuesta.mensaje ||
            (id ? 'Transacción actualizada correctamente'
                : 'Transacción creada correctamente')
        );

        // Reset form
        formTransaccion.reset();
        inputId.value = '';
        botonGuardar.textContent = 'Guardar Transacción';

        cargarTransacciones();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

formTransaccion.addEventListener('submit', guardarTransaccion);

// EDITAR + ELIMINAR
function asignarEventosAcciones() {
    // EDITAR
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(btn => {
        btn.addEventListener('click', () => {
            inputId.value = btn.getAttribute('data-id');
            inputSocio.value = btn.getAttribute('data-socio');
            inputFecha.value = btn.getAttribute('data-fecha');
            selectTipoPago.value = btn.getAttribute('data-tip_pago');
            inputMes.value = btn.getAttribute('data-mes');
            inputAnio.value = btn.getAttribute('data-anio');
            selectMoneda.value = btn.getAttribute('data-moneda');
            inputColones.value = btn.getAttribute('data-colones');
            inputDolares.value = btn.getAttribute('data-dolares');
            inputTipoCambio.value = btn.getAttribute('data-tip_cambio');

            botonGuardar.textContent = 'Actualizar Transacción';
            formTransaccion.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ELIMINAR
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('¿Desea eliminar esta transacción?')) return;

            const payload = {
                accion: 'eliminar',
                id_transaccion: id
            };

            try {
                const res = await fetch(`${API_BASE}/transacciones.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const respuesta = await res.json();
                if (!res.ok || respuesta.ok === false) {
                    throw new Error(respuesta.mensaje || 'Error al eliminar transacción');
                }

                alert(respuesta.mensaje || 'Transacción eliminada correctamente');
                cargarTransacciones();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    });
}
