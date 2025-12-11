const API_BASE = "../api";
const API_ACTIVIDADES = `${API_BASE}/registro_actividades.php`;

const form = document.getElementById("form-actividad");
const tbody = document.getElementById("tbody-actividades");

const cmbTipoActividad = document.getElementById("id_tip_actividad");
const cmbTipoPago = document.getElementById("id_tip_pago");
const cmbCuentaBco = document.getElementById("id_cuenta_bco");

const inputId = document.getElementById("id_actividad");
let modoEdicion = false;
let cacheActividades = [];



async function cargarTiposActividad() {
    const res = await fetch(`${API_BASE}/tipo_actividad.php`);
    const datos = await res.json();

    cmbTipoActividad.innerHTML = `<option disabled selected>Seleccione...</option>`;
    datos.forEach(t => {
        cmbTipoActividad.innerHTML += `<option value="${t.ID_TIP_ACTIVIDAD}">${t.NOMBRE_TIP_ACTIVIDAD}</option>`;
    });
}

async function cargarTiposPago() {
    const res = await fetch(`${API_BASE}/tipos_pago.php`);
    const datos = await res.json();

    cmbTipoPago.innerHTML = `<option disabled selected>Seleccione...</option>`;
    datos.forEach(t => {
        cmbTipoPago.innerHTML += `<option value="${t.ID_TIP_PAGO}">${t.NOMBRE_TIP_PAGO}</option>`;
    });
}

async function cargarCuentasBancarias() {
    const res = await fetch(`${API_BASE}/cuentas_bancarias.php`);
    const datos = await res.json();

    cmbCuentaBco.innerHTML = `<option disabled selected>Seleccione...</option>`;
    datos.forEach(t => {
        cmbCuentaBco.innerHTML += `<option value="${t.ID_CUENTA_BCO}">${t.NOMBRE_CUENTA_BCO}</option>`;
    });
}


async function cargarActividades() {
    const res = await fetch(API_ACTIVIDADES);
    const datos = await res.json();
    cacheActividades = datos;

    tbody.innerHTML = "";

    datos.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${a.ID_ACTIVIDAD}</td>
            <td>${a.NOMBRE_ACTIVIDAD}</td>
            <td>${a.ID_TIP_ACTIVIDAD}</td>
            <td>${a.FECHA_ACTIVIDAD}</td>
            <td>${a.HORA_ACTIVIDAD}</td>
            <td>${a.LUGAR_ACTIVIDAD}</td>
            <td>${a.ID_TIP_PAGO}</td>
            <td>${a.DESCRIP_ACTIVIDAD ?? ""}</td>
            <td>${a.COSTO_ACTIVIDAD}</td>
            <td>${a.MONEDA_ACTIVIDAD}</td>
            <td>${a.ID_CUENTA_BCO}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="editarActividad(${a.ID_ACTIVIDAD})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarActividad(${a.ID_ACTIVIDAD})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function leerFormulario() {
    return {
        nombre_actividad: document.getElementById("nombre_actividad").value,
        id_tip_actividad: document.getElementById("id_tip_actividad").value,
        fecha_actividad: document.getElementById("fecha_actividad").value,
        hora_actividad: document.getElementById("hora_actividad").value,
        lugar_actividad: document.getElementById("lugar_actividad").value,
        id_tip_pago: document.getElementById("id_tip_pago").value,
        descrip_actividad: document.getElementById("descrip_actividad").value,
        costo_actividad: document.getElementById("costo_actividad").value,
        moneda_actividad: document.getElementById("moneda_actividad").value,
        id_cuenta_bco: document.getElementById("id_cuenta_bco").value
    };
}



form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = leerFormulario();
    const fd = new FormData();

    Object.entries(data).forEach(([k, v]) => fd.append(k, v));

    if (modoEdicion) {
        fd.append("accion", "actualizar");
        fd.append("id_actividad", inputId.value);
    } else {
        fd.append("accion", "crear");
    }

    const res = await fetch(API_ACTIVIDADES, {
        method: "POST",
        body: fd
    });

    const respuesta = await res.json();

    if (!respuesta.ok) {
        alert(respuesta.mensaje);
        return;
    }

    alert(respuesta.mensaje);
    form.reset();
    inputId.value = "";
    modoEdicion = false;

    cargarActividades();
});

window.editarActividad = function (id) {
    const a = cacheActividades.find(x => x.ID_ACTIVIDAD == id);

    if (!a) return alert("Actividad no encontrada");

    inputId.value = a.ID_ACTIVIDAD;
    document.getElementById("nombre_actividad").value = a.NOMBRE_ACTIVIDAD;
    document.getElementById("id_tip_actividad").value = a.ID_TIP_ACTIVIDAD;
    document.getElementById("fecha_actividad").value = a.FECHA_ACTIVIDAD;
    document.getElementById("hora_actividad").value = a.HORA_ACTIVIDAD;
    document.getElementById("lugar_actividad").value = a.LUGAR_ACTIVIDAD;
    document.getElementById("id_tip_pago").value = a.ID_TIP_PAGO;
    document.getElementById("descrip_actividad").value = a.DESCRIP_ACTIVIDAD ?? "";
    document.getElementById("costo_actividad").value = a.COSTO_ACTIVIDAD;
    document.getElementById("moneda_actividad").value = a.MONEDA_ACTIVIDAD;
    document.getElementById("id_cuenta_bco").value = a.ID_CUENTA_BCO;

    modoEdicion = true;
};

window.eliminarActividad = async function (id) {
    if (!confirm("¿Seguro que desea eliminar esta actividad?")) return;

    const fd = new FormData();
    fd.append("accion", "eliminar");
    fd.append("id_actividad", id);

    const res = await fetch(API_ACTIVIDADES, {
        method: "POST",
        body: fd
    });

    const respuesta = await res.json();

    if (!respuesta.ok) {
        alert(respuesta.mensaje);
        return;
    }

    alert(respuesta.mensaje);
    cargarActividades();
};


document.addEventListener("DOMContentLoaded", () => {
    cargarActividades();
    cargarTiposActividad();
    cargarTiposPago();
    cargarCuentasBancarias();
});
