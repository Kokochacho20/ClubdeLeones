const API_BASE = '../api';

const formRecibo = document.getElementById('form-busqueda');
const inputIdTransac = document.getElementById('id_transaccion_recibo');
const selectSocioRecibo = document.getElementById('id_socio_recibo');
const areaRecibo = document.getElementById('area-recibo');
const alertRecibo = document.getElementById('alert-recibo');

const spanReciboNumero = document.getElementById('recibo-numero');
const spanReciboFecha = document.getElementById('recibo-fecha');
const spanReciboSocio = document.getElementById('recibo-socio');
const spanReciboActividad = document.getElementById('recibo-actividad');
const spanReciboActividadDet = document.getElementById('recibo-actividad-detalle');
const spanReciboMonto = document.getElementById('recibo-monto');
const spanReciboTotal = document.getElementById('recibo-total');
const spanReciboFormaPago = document.getElementById('recibo-forma-pago');
const spanReciboTipoCambio = document.getElementById('recibo-tipo-cambio');

async function cargarSociosRecibo() {
    try {
        const res = await fetch(`${API_BASE}/socios.php`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const raw = await res.text();
        let socios = [];
        try {
            socios = JSON.parse(raw);
        } catch {
            console.error('JSON inválido socios.php:', raw);
            return;
        }

        selectSocioRecibo.innerHTML = '<option value="">(Opcional) Seleccione un socio…</option>';

        socios.forEach(s => {
            const id = s.ID_SOCIO ?? s.id_socio;
            const nombre = s.NOMBRE_SOCIO ?? s.nombre_socio;
            const numero = s.NUMERO_SOCIO ?? s.numero_socio ?? '';
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = numero ? `${numero} - ${nombre}` : nombre;
            selectSocioRecibo.appendChild(opt);
        });
    } catch (err) {
        console.error('Error cargando socios para recibo:', err);
    }
}

formRecibo.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idTrans = parseInt(inputIdTransac.value, 10);
    if (!idTrans) {
        alert('Debe indicar un ID de transacción válido');
        return;
    }

    const params = new URLSearchParams({ id_transaccion: idTrans });

    try {
        const url = `${API_BASE}/recibo_pago.php?` + params.toString();
        const res = await fetch(url);
        const raw = await res.text();

        if (!res.ok) {
            console.error('HTTP error:', raw);
            alertRecibo.style.display = 'block';
            alertRecibo.className = 'alert alert-danger mt-3';
            alertRecibo.textContent = 'Error al buscar la transacción';
            areaRecibo.style.display = 'none';
            return;
        }

        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            console.error('JSON inválido:', raw);
            alertRecibo.style.display = 'block';
            alertRecibo.className = 'alert alert-danger mt-3';
            alertRecibo.textContent = 'La respuesta del servidor no es JSON válido';
            areaRecibo.style.display = 'none';
            return;
        }

        if (!data.ok || !data.recibo) {
            alertRecibo.style.display = 'block';
            alertRecibo.className = 'alert alert-warning mt-3';
            alertRecibo.textContent = data.mensaje || 'No se encontró la transacción indicada';
            areaRecibo.style.display = 'none';
            return;
        }

        renderRecibo(data.recibo);
    } catch (err) {
        console.error('Error fetch recibo:', err);
        alertRecibo.style.display = 'block';
        alertRecibo.className = 'alert alert-danger mt-3';
        alertRecibo.textContent = 'Ocurrió un error al generar el recibo';
        areaRecibo.style.display = 'none';
    }
});

function renderRecibo(r) {
    const data = {};
    Object.keys(r).forEach(k => {
        data[k.toLowerCase()] = r[k];
    });

    const idTrans = data.id_transaccion;
    const fechaTrans = data.fec_transaccion || '';
    const nombreSocio = data.nombre_socio || '';
    const numeroSocio = data.numero_socio || '';
    const nombreActividad = data.nombre_actividad || '';
    const fechaActividad = data.fecha_actividad || '';
    const lugarActividad = data.lugar_actividad || '';
    const nombreTipPago = data.nombre_tip_pago || '';
    const tipo = data.tipo || '';
    const moneda = data.moneda_transac || 'C';
    const montoCol = Number(data.monto_colones || 0);
    const montoDol = Number(data.monto_dolares || 0);
    const tcCompra = data.tc_compra;
    const tcVenta = data.tc_venta;
    const fecTc = data.fec_tip_cambio || '';

    const monto = moneda === 'D' ? montoDol : montoCol;
    const simbolo = moneda === 'D' ? '$' : '₡';

    spanReciboNumero.textContent = String(idTrans).padStart(4, '0');
    spanReciboFecha.textContent = fechaTrans;
    spanReciboSocio.textContent = numeroSocio
        ? `${nombreSocio} (Socio #: ${numeroSocio})`
        : nombreSocio;
    spanReciboActividad.textContent = nombreActividad || '(Sin actividad asociada)';
    spanReciboActividadDet.textContent =
        `${lugarActividad || 'Sin lugar registrado'} – ${fechaActividad || 'sin fecha registrada'}`;

    const textoConcepto = `Pago asociado a la actividad "${nombreActividad || 'N/A'}"`;
    document.getElementById('recibo-descripcion').textContent = textoConcepto;

    spanReciboMonto.textContent = `${simbolo}${monto.toFixed(2)}`;
    spanReciboTotal.textContent = `${simbolo}${monto.toFixed(2)}`;

    spanReciboFormaPago.textContent =
        `${nombreTipPago}${tipo ? ' (' + tipo + ')' : ''} – Moneda: ${moneda === 'D' ? 'Dólares' : 'Colones'}`;

    if (tcCompra != null && tcVenta != null) {
        spanReciboTipoCambio.textContent =
            `Compra: ${tcCompra} / Venta: ${tcVenta} (Fecha: ${fecTc})`;
    } else {
        spanReciboTipoCambio.textContent = 'No se registró tipo de cambio para esta transacción';
    }

    alertRecibo.style.display = 'block';
    alertRecibo.className = 'alert alert-success mt-3';
    alertRecibo.textContent = 'Recibo generado correctamente.';
    areaRecibo.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarSociosRecibo();
});
