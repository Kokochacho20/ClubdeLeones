const API_BASE = '../api';

const formCuotas = document.getElementById('form-reporte-cuotas');
const selectSocioCuotas = document.getElementById('id_socio_filtro');
const inputDesdeCuotas = document.getElementById('fecha_desde');
const inputHastaCuotas = document.getElementById('fecha_hasta');
const btnLimpiarCuotas = document.getElementById('btn-limpiar-cuotas');

const tbodyCuotas = document.getElementById('tbody-cuotas');
const spanTotalPeriodo = document.getElementById('total-periodo');
const spanSocioSeleccionado = document.getElementById('socio-seleccionado');
const alertCuotas = document.getElementById('alert-cuotas');

async function cargarSociosParaCuotas() {
    try {
        const res = await fetch(`${API_BASE}/socios.php`);
        if (!res.ok) throw new Error('Error HTTP ' + res.status);
        const raw = await res.text();
        let socios = [];

        try {
            socios = JSON.parse(raw);
        } catch {
            console.error('JSON inválido socios.php:', raw);
            alert('Error al leer los socios desde el servidor');
            return;
        }

        selectSocioCuotas.innerHTML = '<option value="">Seleccione un Socio</option>';

        socios.forEach(s => {
            const id = s.ID_SOCIO ?? s.id_socio;
            const nombre = s.NOMBRE_SOCIO ?? s.nombre_socio;
            const numero = s.NUMERO_SOCIO ?? s.numero_socio ?? '';
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = numero ? `${numero} - ${nombre}` : nombre;
            selectSocioCuotas.appendChild(opt);
        });
    } catch (err) {
        console.error('Error cargando socios:', err);
        alert('No se pudieron cargar los socios');
    }
}

formCuotas.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idSocio = selectSocioCuotas.value;
    const fechaDesde = inputDesdeCuotas.value;
    const fechaHasta = inputHastaCuotas.value;

    if (!idSocio || !fechaDesde || !fechaHasta) {
        alert('Debe seleccionar socio y rango de fechas');
        return;
    }

    const params = new URLSearchParams({
        id_socio: idSocio,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
    });

    try {
        const url = `${API_BASE}/reporte_pagos_cuotas.php?` + params.toString();
        const res = await fetch(url);
        const raw = await res.text();

        if (!res.ok) {
            console.error('Respuesta HTTP error:', raw);
            alert('Error al generar el reporte de cuotas');
            return;
        }

        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            console.error('JSON inválido:', raw);
            alert('La respuesta del servidor no es JSON válido');
            return;
        }

        if (!data.ok) {
            alert(data.mensaje || 'Error al generar el reporte');
            return;
        }

        renderCuotas(data.datos || []);
        renderTotalPeriodo(data.total_periodo ?? 0);

        const selectedText = selectSocioCuotas.options[selectSocioCuotas.selectedIndex]?.textContent || '';
        spanSocioSeleccionado.textContent = selectedText
            ? `– ${selectedText}, del ${fechaDesde} al ${fechaHasta}`
            : '';

    } catch (err) {
        console.error('Error fetch cuotas:', err);
        alert('Ocurrió un error al generar el reporte de cuotas');
    }
});

function renderCuotas(filas) {
    tbodyCuotas.innerHTML = '';

    if (!filas.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" class="text-center">No hay pagos para los filtros seleccionados</td>`;
        tbodyCuotas.appendChild(tr);
        alertCuotas.style.display = 'none';
        return;
    }

    filas.forEach(fila => {
        const f = fila.fec_transaccion ?? fila.FEC_TRANSACCION ?? '';
        const actividad = fila.nombre_actividad ?? fila.NOMBRE_ACTIVIDAD ?? '';
        const tipopago = fila.nombre_tip_pago ?? fila.NOMBRE_TIP_PAGO ?? '';
        const tipo = fila.tipo ?? fila.TIPO ?? '';
        const moneda = fila.moneda_transac ?? fila.MONEDA_TRANSAC ?? 'C';
        const montoColones = Number(fila.monto_colones ?? fila.MONTO_COLONES ?? 0);
        const montoDolares = Number(fila.monto_dolares ?? fila.MONTO_DOLARES ?? 0);
        const mes = fila.mes_pago ?? fila.MES_PAGO ?? '';
        const anio = fila.an_pago ?? fila.AN_PAGO ?? '';

        const monto = moneda === 'D' ? montoDolares : montoColones;
        const simbolo = moneda === 'D' ? '$' : '₡';

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${f}</td>
      <td>${actividad}</td>
      <td>${tipopago} ${tipo ? '(' + tipo + ')' : ''}</td>
      <td>${moneda === 'D' ? 'Dólares' : 'Colones'}</td>
      <td class="text-end">${simbolo}${monto.toFixed(2)}</td>
      <td>${mes}/${anio}</td>
    `;
        tbodyCuotas.appendChild(tr);
    });

    alertCuotas.textContent = 'El reporte muestra los pagos de cuotas registrados para el socio y período seleccionados.';
    alertCuotas.style.display = 'block';
}

function renderTotalPeriodo(total) {
    const numero = Number(total || 0);
    spanTotalPeriodo.textContent = numero.toFixed(2);
}

btnLimpiarCuotas.addEventListener('click', () => {
    selectSocioCuotas.value = '';
    inputDesdeCuotas.value = '';
    inputHastaCuotas.value = '';
    spanSocioSeleccionado.textContent = '';
    alertCuotas.style.display = 'none';
    tbodyCuotas.innerHTML = `
    <tr>
      <td colspan="6" class="text-center">
        Use los filtros superiores y presione "Generar Reporte".
      </td>
    </tr>`;
    spanTotalPeriodo.textContent = '0.00';
});

document.addEventListener('DOMContentLoaded', () => {
    cargarSociosParaCuotas();
});
