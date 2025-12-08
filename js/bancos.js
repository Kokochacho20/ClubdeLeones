const API_BASE = '../api';

const formBanco = document.getElementById('form-banco');
const tbodyBancos = document.getElementById('tbody-bancos');

const inputId = document.getElementById('id_banco');
const inputNombre = document.getElementById('nombre_banco');
const inputTel1 = document.getElementById('tel_banco1');
const inputTel2 = document.getElementById('tel_banco2');
const inputCont1 = document.getElementById('contacto_banco1');
const inputCont2 = document.getElementById('contacto_banco2');
const botonGuardar = formBanco.querySelector("button[type='submit']");

document.addEventListener('DOMContentLoaded', () => {
    cargarBancos();
    formBanco.addEventListener('submit', guardarBanco);
});

// LISTADO BANCOS
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
                    <button 
                        class="btn btn-sm btn-amarillo btn-editar"
                        data-id="${b.ID_BANCO}"
                        data-nombre="${b.NOMBRE_BANCO}"
                        data-tel1="${b.TEL_BANCO1}"
                        data-tel2="${b.TEL_BANCO2 ?? ''}"
                        data-cont1="${b.CONTACTO_BANCO1}"
                        data-cont2="${b.CONTACTO_BANCO2 ?? ''}"
                    >Editar</button>
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

function validarTelefonoSimple(valor, { obligatorio = false, etiqueta = 'Teléfono' } = {}) {
    const tel = valor.trim();

    if (!tel) {
        if (obligatorio) {
            alert(`${etiqueta} es obligatorio`);
            return false;
        }
        // No obligatorio y vacío → OK
        return true;
    }

    // Solo dígitos
    if (!/^[0-9]+$/.test(tel)) {
        alert(`${etiqueta} solo puede contener números (no se permiten letras ni símbolos)`);
        return false;
    }

    // Mínimo 8 dígitos
    if (tel.length < 8) {
        alert(`${etiqueta} debe tener al menos 8 dígitos`);
        return false;
    }

    // Máximo 10 para que quepa en NUMBER(10)
    if (tel.length > 10) {
        alert(`${etiqueta} no puede tener más de 10 dígitos`);
        return false;
    }

    return true;
}



// CREAR / ACTUALIZAR BANCO
async function guardarBanco(e) {
    e.preventDefault();

    const id_banco = inputId.value.trim();
    const nombre_banco = inputNombre.value.trim();
    const tel_banco1 = inputTel1.value.trim();
    const tel_banco2 = inputTel2.value.trim();
    const contacto_banco1 = inputCont1.value.trim();
    const contacto_banco2 = inputCont2.value.trim();

    if (!nombre_banco) {
        alert('El nombre del banco es obligatorio');
        return;
    }

    if (!validarTelefonoSimple(tel_banco1, { obligatorio: true, etiqueta: 'Teléfono principal' })) {
        return;
    }

    if (!validarTelefonoSimple(tel_banco2, { obligatorio: false, etiqueta: 'Teléfono secundario' })) {
        return;
    }

    if (!contacto_banco1) {
        alert('El contacto principal es obligatorio');
        return;
    }

    const accion = id_banco ? 'actualizar' : 'crear';

    const payload = {
        accion,
        nombre_banco,
        tel_banco1,
        tel_banco2,
        contacto_banco1,
        contacto_banco2
    };

    if (id_banco) {
        payload.id_banco = id_banco;
    }

    try {
        const res = await fetch(`${API_BASE}/bancos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();
        if (!res.ok || respuesta.ok === false) {
            throw new Error(respuesta.mensaje || 'Error al guardar banco');
        }

        alert(
            respuesta.mensaje ||
            (id_banco ? 'Banco actualizado correctamente' : 'Banco creado correctamente')
        );

        formBanco.reset();
        inputId.value = '';
        botonGuardar.textContent = 'Guardar Banco';

        cargarBancos();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}



// EDITAR + ELIMINAR
function asignarEventosAcciones() {
    // EDITAR
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const nombre = btn.getAttribute('data-nombre');
            const tel1 = btn.getAttribute('data-tel1');
            const tel2 = btn.getAttribute('data-tel2');
            const cont1 = btn.getAttribute('data-cont1');
            const cont2 = btn.getAttribute('data-cont2');

            inputId.value = id;
            inputNombre.value = nombre;
            inputTel1.value = tel1;
            inputTel2.value = tel2;
            inputCont1.value = cont1;
            inputCont2.value = cont2;

            botonGuardar.textContent = 'Actualizar Banco';

            formBanco.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ELIMINAR
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
