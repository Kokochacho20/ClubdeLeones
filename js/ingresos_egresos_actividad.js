const API_BASE = "../api";
const API = `${API_BASE}/ingresos_egresos_actividad.php`;

const form = document.getElementById("form-transaccion");
const tbody = document.getElementById("tbody-transacciones");

const idTransaccion = document.getElementById("id_transaccion");
const idActivSoc = document.getElementById("id_activ_soc");
const fecha = document.getElementById("fec_transaccion");
const tipoPago = document.getElementById("id_tip_pago");
const mesPago = document.getElementById("mes_pago");
const anPago = document.getElementById("an_pago");
const moneda = document.getElementById("moneda_transac");
const montoColones = document.getElementById("monto_colones");
const montoDolares = document.getElementById("monto_dolares");
const tipoCambio = document.getElementById("id_tip_cambio");

document.addEventListener("DOMContentLoaded", () => {
    cargarTransacciones();
    cargarActividadesSocios();
    cargarTiposPago();
    cargarTiposCambio();
});

async function leerJSON(url, ctx) {
    const res = await fetch(url);
    const texto = await res.text();
    console.log(`RAW ${ctx}:`, texto);

    let datos = null;
    try {
        datos = texto ? JSON.parse(texto) : null;
    } catch (e) {
        throw new Error(`Respuesta no es JSON válido en ${ctx}`);
    }

    if (!res.ok && datos && datos.mensaje) {
        throw new Error(datos.mensaje);
    }

    return datos;
}



// CARGAR LISTA
async function cargarTransacciones() {
    try {
        const datos = await leerJSON(API, 'cargarTransacciones');

        tbody.innerHTML = "";

        (datos || []).forEach(t => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${t.ID_TRANSACCION}</td>
                <td>${t.ID_ACTIV_SOC}</td>
                <td>${t.FEC_TRANSACCION}</td>
                <td>${t.ID_TIP_PAGO}</td>
                <td>${t.MES_PAGO}</td>
                <td>${t.AN_PAGO}</td>
                <td>${t.MONEDA_TRANSAC}</td>
                <td>${t.MONTO_COLONES}</td>
                <td>${t.MONTO_DOLARES || ""}</td>
                <td>${t.ID_TIP_CAMBIO}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editar(${t.ID_TRANSACCION})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminar(${t.ID_TRANSACCION})">Eliminar</button>
                </td>
            `;

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        alert(err.message || 'Error al cargar transacciones');
    }
}


// EDITAR
window.editar = function (id) {
    const fila = [...tbody.children].find(tr => tr.children[0].textContent == id);
    if (!fila) return;

    idTransaccion.value = fila.children[0].textContent;
    idActivSoc.value = fila.children[1].textContent;
    fecha.value = fila.children[2].textContent;
    tipoPago.value = fila.children[3].textContent;
    mesPago.value = fila.children[4].textContent;
    anPago.value = fila.children[5].textContent;
    moneda.value = fila.children[6].textContent;
    montoColones.value = fila.children[7].textContent;
    montoDolares.value = fila.children[8].textContent;
    tipoCambio.value = fila.children[9].textContent;

    document.querySelector("button[type='submit']").textContent = "Actualizar";
    form.scrollIntoView({ behavior: "smooth" });
};

// ELIMINAR
window.eliminar = async function (id) {
    if (!confirm("¿Eliminar esta transacción?")) return;

    const fd = new FormData();
    fd.append("accion", "eliminar");
    fd.append("id_transaccion", id);

    const res = await fetch(API, { method: "POST", body: fd });
    const r = await res.json();

    alert(r.mensaje);
    cargarTransacciones();
};

// CARGAR COMBO ACTIVIDADES - SOCIOS
async function cargarActividadesSocios() {
    try {
        const res = await fetch(`${API_BASE}/actividades_por_socio.php?combo=1`);
        if (!res.ok) throw new Error('Error al cargar actividades-socio');

        const datos = await res.json();

        const select = document.getElementById("id_activ_soc");
        select.innerHTML = `<option value="" disabled selected>Seleccione actividad - socio</option>`;

        datos.forEach(item => {
            const label = `${item.NOMBRE_ACTIVIDAD} - ${item.NOMBRE_SOCIO}`;
            select.innerHTML += `<option value="${item.ID_ACTIV_SOC}">${label}</option>`;
        });
    } catch (err) {
        console.error(err);
        alert('No se pudo cargar el combo Actividad-Socio');
    }
}

// CARGAR COMBO TIPOS DE PAGO
async function cargarTiposPago() {
    try {
        const url = `${API}?tipos_pago=1`;
        const datos = await leerJSON(url, 'cargarTiposPago');

        tipoPago.innerHTML = `<option value="" disabled selected>Seleccione...</option>`;

        (datos || []).forEach(tp => {
            const id = tp.ID_TIP_PAGO || tp.id_tip_pago;
            const nombre = tp.NOMBRE_TIP_PAGO || tp.nombre_tip_pago;

            if (!id || !nombre) return;

            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = `${nombre} (${id})`;
            tipoPago.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
        alert(err.message || 'No se pudieron cargar los tipos de pago');
    }
}

// CARGAR COMBO TIPO DE CAMBIO 
async function cargarTiposCambio() {
    try {
        const res = await fetch(`${API_BASE}/tipo_cambio.php`);
        const raw = await res.text();
        console.log("RAW cargarTiposCambio:", raw);

        const datos = raw ? JSON.parse(raw) : [];

        tipoCambio.innerHTML = `<option value="" disabled selected>Seleccione tipo de cambio...</option>`;

        (datos || []).forEach(tc => {
            const id = tc.ID_TIP_CAMBIO || tc.id_tip_cambio;
            const fecha = tc.FEC_TIP_CAMBIO || tc.fec_tip_cambio;
            const compra = tc.TC_COMPRA || tc.tc_compra;
            const venta = tc.TC_VENTA || tc.tc_venta;

            if (!id) return;

            const label = `${fecha} - Compra: ${compra} / Venta: ${venta}`;
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = label;
            tipoCambio.appendChild(opt);
        });

    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los tipos de cambio");
    }
}



// GUARDAR / ACTUALIZAR
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData();
    const id = idTransaccion.value;

    fd.append("accion", id ? "actualizar" : "crear");

    if (id) fd.append("id_transaccion", id);

    fd.append("id_activ_soc", idActivSoc.value);
    fd.append("fec_transaccion", fecha.value);
    fd.append("id_tip_pago", tipoPago.value);
    fd.append("mes_pago", mesPago.value);
    fd.append("an_pago", anPago.value);
    fd.append("moneda_transac", moneda.value);
    fd.append("monto_colones", montoColones.value);
    fd.append("monto_dolares", montoDolares.value);
    fd.append("id_tip_cambio", tipoCambio.value);

    const res = await fetch(API, { method: "POST", body: fd });
    const r = await res.json();

    alert(r.mensaje);

    form.reset();
    idTransaccion.value = "";
    document.querySelector("button[type='submit']").textContent = "Guardar";

    cargarTransacciones();
});
