const API_BASE = '../api';

const formTipoCambio = document.getElementById('form-tipo-cambio');
const tbodyTipoCambio = document.getElementById('tbody-tipo-cambio');
const inputId = document.getElementById('id_tip_cambio');
const inputFecha = document.getElementById('fec_tip_cambio');
const inputCompra = document.getElementById('tc_compra');
const inputVenta = document.getElementById('tc_venta');
const botonGuardar = formTipoCambio.querySelector("button[type='submit']");

document.addEventListener('DOMContentLoaded', () => {
    cargarTiposCambio();
});

// LISTADO DE TIPOS DE CAMBIO
async function cargarTiposCambio() {
    try {
        const res = await fetch(`${API_BASE}/tipo_cambio.php`);
        if (!res.ok) throw new Error('Error al cargar tipos de cambio');
        const tipos = await res.json();
        tbodyTipoCambio.innerHTML = '';

        tipos.forEach(t => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${t.ID_TIP_CAMBIO}</td>
                <td>${t.FEC_TIP_CAMBIO}</td>
                <td>${t.TC_COMPRA}</td>
                <td>${t.TC_VENTA}</td>
                <td>
                    <button 
                        class="btn btn-sm btn-amarillo btn-editar"
                        data-id="${t.ID_TIP_CAMBIO}"
                        data-fecha="${t.FEC_TIP_CAMBIO}"
                        data-compra="${t.TC_COMPRA}"
                        data-venta="${t.TC_VENTA}"
                    >Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${t.ID_TIP_CAMBIO}">Eliminar</button>
                </td>
            `;
            tbodyTipoCambio.appendChild(tr);
        });

        asignarEventosAcciones();
    } catch (err) {
        console.error(err);
        alert('No se pudieron cargar los tipos de cambio');
    }
}

// CREAR / ACTUALIZAR TIPO DE CAMBIO
async function guardarTipoCambio(e) {
    e.preventDefault();

    const id = inputId.value.trim();
    const fecha = inputFecha.value.trim();
    const compra = inputCompra.value.trim();
    const venta = inputVenta.value.trim();

    if (!fecha || !compra || !venta) {
        alert('Complete todos los campos');
        return;
    }

    const accion = id ? 'actualizar' : 'crear';

    const payload = {
        accion,
        fec_tip_cambio: fecha,
        tc_compra: compra,
        tc_venta: venta
    };

    if (id) {
        payload.id_tip_cambio = id;
    }

    try {
        const res = await fetch(`${API_BASE}/tipo_cambio.php`, {
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
            throw new Error(respuesta.mensaje || 'Error al guardar tipo de cambio');
        }

        alert(
            respuesta.mensaje ||
            (id ? 'Tipo de cambio actualizado correctamente'
                : 'Tipo de cambio creado correctamente')
        );

        // Reset form
        formTipoCambio.reset();
        inputId.value = '';
        botonGuardar.textContent = 'Guardar Tipo de Cambio';

        cargarTiposCambio();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

formTipoCambio.addEventListener('submit', guardarTipoCambio);

// EDITAR + ELIMINAR
function asignarEventosAcciones() {
    // EDITAR
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(btn => {
        btn.addEventListener('click', () => {
            inputId.value = btn.getAttribute('data-id');
            inputFecha.value = btn.getAttribute('data-fecha');
            inputCompra.value = btn.getAttribute('data-compra');
            inputVenta.value = btn.getAttribute('data-venta');

            botonGuardar.textContent = 'Actualizar Tipo de Cambio';
            formTipoCambio.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ELIMINAR
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('¿Desea eliminar este tipo de cambio?')) return;

            const payload = {
                accion: 'eliminar',
                id_tip_cambio: id
            };

            try {
                const res = await fetch(`${API_BASE}/tipo_cambio.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const respuesta = await res.json();
                if (!res.ok || respuesta.ok === false) {
                    throw new Error(respuesta.mensaje || 'Error al eliminar tipo de cambio');
                }

                alert(respuesta.mensaje || 'Tipo de cambio eliminado correctamente');
                cargarTiposCambio();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    });
}