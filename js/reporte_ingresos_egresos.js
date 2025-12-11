const API_BASE = '../api';

const formReporte = document.getElementById('form-reporte-ingresos-egresos');
const selectActividad = document.getElementById('id_actividad');
const inputDesde = document.getElementById('fecha_desde');
const inputHasta = document.getElementById('fecha_hasta');
const selectTipo = document.getElementById('tipo');

const tbodyReporte = document.getElementById('tbody-reporte');
const spanTotalIng = document.getElementById('total-ingresos');
const spanTotalEgr = document.getElementById('total-egresos');
const spanBalance = document.getElementById('balance-final');
async function cargarActividades() {
    try {
        const res = await fetch(`${API_BASE}/actividades.php`);
        if (!res.ok) throw new Error('Error al cargar actividades');

        const actividades = await res.json();
        console.log('Actividades cargadas:', actividades);

        selectActividad.innerHTML = '<option value="">Seleccione una Actividad</option>';

        actividades.forEach(act => {
            const opt = document.createElement('option');
            const id = act.ID_ACTIVIDAD ?? act.id_actividad;
            const nombre = act.NOMBRE_ACTIVIDAD ?? act.nombre_actividad;

            opt.value = id;
            opt.textContent = nombre;
            selectActividad.appendChild(opt);
        });

    } catch (err) {
        console.error('Error cargando actividades:', err);
        alert('No se pudieron cargar las actividades desde el servidor');
    }
}


formReporte.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idActividad = selectActividad.value;
    const fechaDesde = inputDesde.value;
    const fechaHasta = inputHasta.value;
    const tipo = selectTipo.value;

    if (!idActividad || !fechaDesde || !fechaHasta) {
        alert('Debe seleccionar actividad y rango de fechas');
        return;
    }

    const params = new URLSearchParams({
        id_actividad: idActividad,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        tipo: tipo
    });

    try {
        const url = `${API_BASE}/reporte_ingresos_egresos.php?` + params.toString();
        console.log('Llamando a:', url);

        const res = await fetch(url);

        const raw = await res.text();
        console.log('RAW respuesta PHP:', raw);

        if (!res.ok) {
            throw new Error('HTTP ' + res.status + ' - ' + raw);
        }

        let data;
        try {
            data = JSON.parse(raw);
        } catch (errJson) {
            console.error('Error al parsear JSON:', errJson);
            alert('La respuesta del servidor no es JSON válido. Revisa la consola para ver el detalle.');
            return;
        }

        if (!data.ok) {
            alert(data.mensaje || 'Error al generar el reporte');
            return;
        }

        renderReporte(data.datos || []);
        renderTotales(data.totales || {});

    } catch (err) {
        console.error('Error en fetch:', err);
        alert('Ocurrió un error al generar el reporte. Revisa la consola.');
    }
});


function renderReporte(filas) {
    tbodyReporte.innerHTML = '';

    if (!filas.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" class="text-center">No hay datos para los filtros seleccionados</td>`;
        tbodyReporte.appendChild(tr);
        return;
    }

    filas.forEach(item => {
        const fecha = item.fec_transaccion;
        const tipoMov = item.tipo_movimiento === 'I' ? 'Ingreso' : 'Egreso';
        const tipoPago = item.nombre_tipo_pago;
        const monto = Number(item.monto || 0).toFixed(2);
        const nombreSocio = item.nombre_socio;
        const idTransaccion = item.id_transaccion;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idTransaccion}</td>
            <td>${fecha}</td>
            <td>${tipoMov}</td>
            <td>${tipoPago}</td>
            <td class="text-end">${monto}</td>
            <td>${nombreSocio}</td>
        `;
        tbodyReporte.appendChild(tr);
    });
}

function renderTotales(totales) {
    const totalIng = Number(totales.total_ingresos || 0);
    const totalEgr = Number(totales.total_egresos || 0);
    const balance = Number(totales.balance_final || 0);

    if (spanTotalIng) spanTotalIng.textContent = totalIng.toFixed(2);
    if (spanTotalEgr) spanTotalEgr.textContent = totalEgr.toFixed(2);
    if (spanBalance) spanBalance.textContent = balance.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
    cargarActividades();
});
