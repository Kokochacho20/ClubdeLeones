const API_TIPOS_PAGO = '../api/tipos_pago.php';

document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('form-tipo-pago');
    const tbody = document.querySelector('table tbody');

    const idInput = document.getElementById('id_tipo');
    const nombreInput = document.getElementById('nombre_tipo');
    const periodicidadSelect = document.getElementById('periodicidad');
    const tipoSelect = document.getElementById('tipo');
    const monedaSelect = document.getElementById('moneda');

    let tiposPago = [];

    async function leerJSON(res, ctx) {
        const txt = await res.text();
        if (txt === '') return null;
        try {
            return JSON.parse(txt);
        } catch (e) {
            console.error('RAW (' + ctx + '):', txt);
            throw new Error('El servidor no devolvió JSON válido');
        }
    }

    function textoPeriodicidad(c) {
        switch (c) {
            case 'M': return 'Mensual';
            case 'T': return 'Trimestral';
            case 'D': return 'Diaria';
            default: return c || '';
        }
    }

    function textoTipo(c) {
        switch (c) {
            case 'I': return 'Ingreso';
            case 'E': return 'Egreso';
            default: return c || '';
        }
    }

    function textoMoneda(c) {
        switch (c) {
            case 'C': return 'Colones';
            case 'D': return 'Dólares';
            default: return c || '';
        }
    }

    // Cargar lista  tipos de pago
    async function cargarTiposPago() {
        try {
            const res = await fetch(API_TIPOS_PAGO);
            const data = await leerJSON(res, 'listar');

            if (!res.ok) {
                throw new Error((data && data.error) || 'Error al cargar tipos de pago');
            }

            tiposPago = Array.isArray(data) ? data : [];
            mostrarTiposPago(tiposPago);

        } catch (err) {
            console.error(err);
            mostrarAlerta(err.message || 'Error al cargar tipos de pago', 'danger');
        }
    }

    // Pintar la tabla
    function mostrarTiposPago(lista) {
        tbody.innerHTML = '';

        lista.forEach(t => {
            const id = t.ID_TIP_PAGO || t.id_tip_pago;
            const nom = t.NOMBRE_TIP_PAGO || t.nombre_tip_pago || '';
            const per = t.PERIODICIDAD || t.periodicidad || '';
            const tipo = t.TIPO || t.tipo || '';
            const mon = t.MONEDA || t.moneda || '';

            const tr = document.createElement('tr');
            tr.dataset.id = id;

            tr.innerHTML = `
                <td>${id}</td>
                <td>${nom}</td>
                <td>${textoPeriodicidad(per)} (${per})</td>
                <td>${textoTipo(tipo)} (${tipo})</td>
                <td>${textoMoneda(mon)} (${mon})</td>
                <td>
                    <button type="button" class="btn btn-sm btn-warning me-2" onclick="editarTipoPago(${id})">
                        Editar
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="eliminarTipoPago(${id})">
                        Eliminar
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    // Cargar registro en el formulario
    function cargarEnFormulario(t) {
        const id = t.ID_TIP_PAGO || t.id_tip_pago || '';
        const nom = t.NOMBRE_TIP_PAGO || t.nombre_tip_pago || '';
        const per = t.PERIODICIDAD || t.periodicidad || 'M';
        const tipo = t.TIPO || t.tipo || 'I';
        const mon = t.MONEDA || t.moneda || 'C';

        idInput.value = id;
        nombreInput.value = nom;

        periodicidadSelect.value = ['M', 'T', 'D'].includes(per) ? per : 'M';
        tipoSelect.value = ['I', 'E'].includes(tipo) ? tipo : 'I';
        monedaSelect.value = ['C', 'D'].includes(mon) ? mon : 'C';
    }

    function limpiarFormulario() {
        form.reset();
        idInput.value = '';
        periodicidadSelect.value = 'M';
        tipoSelect.value = 'I';
        monedaSelect.value = 'C';
    }

    // Crear / actualizar
    async function guardarTipoPago() {
        const nombre = nombreInput.value.trim();
        let periodicidad = periodicidadSelect.value;
        let tipo = tipoSelect.value;
        let moneda = monedaSelect.value;

        if (!nombre) {
            mostrarAlerta('El nombre del tipo de pago es obligatorio', 'warning');
            return;
        }

        if (!['M', 'T', 'D'].includes(periodicidad)) periodicidad = 'M';
        if (!['I', 'E'].includes(tipo)) tipo = 'I';
        if (!['C', 'D'].includes(moneda)) moneda = 'C';

        const id = idInput.value.trim();
        const esEdicion = !!id;

        const payload = {
            nombre_tip_pago: nombre,
            periodicidad: periodicidad,
            tipo: tipo,
            moneda: moneda
        };

        try {
            const url = esEdicion ? `${API_TIPOS_PAGO}?id=${id}` : API_TIPOS_PAGO;
            const method = esEdicion ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await leerJSON(res, 'guardar');

            if (!res.ok || (data && data.ok === false)) {
                const msg = data && data.error;
                throw new Error(msg || 'Error al guardar tipo de pago');
            }

            mostrarAlerta(`Tipo de pago ${esEdicion ? 'actualizado' : 'creado'} correctamente`, 'success');
            limpiarFormulario();
            await cargarTiposPago();

        } catch (err) {
            console.error(err);
            mostrarAlerta(err.message || 'Error al guardar tipo de pago', 'danger');
        }
    }

    // Eliminar
    async function eliminarTipoPagoInterno(id) {
        if (!id) return;
        if (!confirm('¿Seguro que desea eliminar este tipo de pago?')) return;

        try {
            const res = await fetch(`${API_TIPOS_PAGO}?id=${id}`, {
                method: 'DELETE'
            });

            let data = null;
            if (res.status !== 204) {
                data = await leerJSON(res, 'eliminar');
            }

            if (!res.ok) {
                const msg = data && data.error;
                throw new Error(msg || 'Error al eliminar tipo de pago');
            }

            mostrarAlerta('Tipo de pago eliminado correctamente', 'success');

            if (String(id) === idInput.value) {
                limpiarFormulario();
            }

            await cargarTiposPago();

        } catch (err) {
            console.error(err);
            mostrarAlerta(err.message || 'Error al eliminar tipo de pago', 'danger');
        }
    }

    // Mostrar alertas bootstrap
    function mostrarAlerta(msg, tipo) {
        const anterior = document.querySelector('.alert');
        if (anterior) anterior.remove();

        const div = document.createElement('div');
        div.className = `alert alert-${tipo} alert-dismissible fade show mt-3`;
        div.role = 'alert';
        div.innerHTML = `
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.querySelector('main');
        container.insertBefore(div, container.firstChild);

        setTimeout(() => {
            if (div.parentNode === container) {
                div.remove();
            }
        }, 5000);
    }

    // Eventos
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        guardarTipoPago();
    });

    window.editarTipoPago = function (id) {
        const t = tiposPago.find(x => String(x.ID_TIP_PAGO || x.id_tip_pago) === String(id));
        if (!t) return;
        cargarEnFormulario(t);
        form.scrollIntoView({ behavior: 'smooth' });
    };

    window.eliminarTipoPago = function (id) {
        eliminarTipoPagoInterno(id);
    };

    cargarTiposPago();
});
