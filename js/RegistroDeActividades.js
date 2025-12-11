const API_ACTIVIDADES = "../api/RegistroDeActividades.php";
const API_TIPOS_ACTIVIDAD = "../api/tipo_actividad.php";
const API_SOCIOS = "../api/socios.php";
const API_TIPOS_PAGO = "../api/tipos_pago.php";
const API_CUENTAS_BANCARIAS = "../api/cuentas_bancarias.php";

async function cargarTiposActividad() {
    const select = document.getElementById("id_tipo_actividad");
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione...</option>';

    try {
        const res = await fetch(API_TIPOS_ACTIVIDAD);
        const raw = await res.text();
        console.log("tipo_actividad.php RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON de tipo_actividad:", e);
            return;
        }

        if (data && Array.isArray(data.data)) {
            data = data.data;
        }

        if (!Array.isArray(data) || data.length === 0) {
            console.warn("Sin tipos de actividad o formato inesperado:", data);
            return;
        }

        data.forEach(t => {
            const id =
                t.ID_TIP_ACTIVIDAD || t.id_tip_actividad ||
                t.ID_TIPO_ACTIVIDAD || t.id_tipo_actividad;

            const nombre =
                t.NOMBRE_TIP_ACTIVIDAD || t.nombre_tip_actividad ||
                t.NOMBRE_TIPO_ACTIVIDAD || t.nombre_tipo_actividad;

            if (!id || !nombre) return;

            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = nombre;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando tipos de actividad:", err);
    }
}

async function cargarSocios() {
    const select = document.getElementById("id_socio_responsable");
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione un socio...</option>';

    try {
        const res = await fetch(API_SOCIOS);
        const raw = await res.text();
        console.log("socios.php RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON de socios:", e);
            return;
        }

        if (data && Array.isArray(data.data)) {
            data = data.data;
        }

        if (!Array.isArray(data) || data.length === 0) {
            console.warn("Sin socios o formato inesperado:", data);
            return;
        }

        data.forEach(s => {
            const id = s.ID_SOCIO || s.id_socio;
            const nombre = s.NOMBRE_SOCIO || s.nombre_socio;
            if (!id || !nombre) return;

            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = nombre;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando socios:", err);
    }
}

async function cargarTiposPago() {
    const select = document.getElementById("id_tip_pago");
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione...</option>';

    try {
        const res = await fetch(API_TIPOS_PAGO);
        const raw = await res.text();
        console.log("tipos_pago.php RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON de tipos_pago:", e);
            return;
        }

        if (data && Array.isArray(data.data)) {
            data = data.data;
        }

        if (!Array.isArray(data) || data.length === 0) {
            console.warn("Sin tipos de pago o formato inesperado:", data);
            return;
        }

        data.forEach(tp => {
            const id =
                tp.ID_TIP_PAGO || tp.id_tip_pago ||
                tp.ID_TIPO_PAGO || tp.id_tipo_pago;

            const nombre =
                tp.NOMBRE_TIP_PAGO || tp.nombre_tip_pago ||
                tp.NOMBRE_TIPO_PAGO || tp.nombre_tipo_pago;

            if (!id || !nombre) return;

            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = nombre;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando tipos de pago:", err);
    }
}

async function cargarCuentasBancarias() {
    const select = document.getElementById("id_cuenta_bco");
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione...</option>';

    try {
        const res = await fetch(API_CUENTAS_BANCARIAS);
        const raw = await res.text();
        console.log("cuentas_bancarias.php RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON de cuentas bancarias:", e);
            return;
        }

        if (data && Array.isArray(data.data)) {
            data = data.data;
        }

        if (!Array.isArray(data) || data.length === 0) {
            console.warn("Sin cuentas bancarias o formato inesperado:", data);
            return;
        }

        data.forEach(c => {
            const id =
                c.ID_CUENTA_BCO || c.id_cuenta_bco ||
                c.ID_CUENTA_BANCARIA || c.id_cuenta_bancaria;

            const nombre =
                c.NOMBRE_CUENTA_BCO || c.nombre_cuenta_bco ||   // ← ESTE es el bueno
                c.NOMBRE_CUENTA || c.nombre_cuenta ||
                c.NOMBRE_CTA_BCO || c.nombre_cta_bco;

            if (!id || !nombre) {
                console.warn("Registro cuenta bancaria sin campos esperados:", c);
                return;
            }

            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = nombre;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando cuentas bancarias:", err);
    }
}


async function cargarActividades() {
    try {
        const res = await fetch(API_ACTIVIDADES);
        const raw = await res.text();
        console.log("RegistroDeActividades.php RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON de actividades:", e);
            data = [];
        }

        if (data && Array.isArray(data.data)) {
            data = data.data;
        }

        const tabla = document.getElementById("tablaActividades");
        if (!tabla) return;

        tabla.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay actividades registradas</td>
                </tr>
            `;
            return;
        }

        data.forEach(a => {
            const id = a.ID_ACTIVIDAD || a.id_actividad;
            const nombre = a.NOMBRE_ACTIVIDAD || a.nombre_actividad;
            const tipo = a.ID_TIP_ACTIVIDAD || a.id_tip_actividad;
            const fecha = a.FEC_ACTIVIDAD || a.FECHA_ACTIVIDAD || a.fec_actividad;
            const costo = a.COSTO_ACTIVIDAD || a.costo_actividad;
            const moneda = a.MONEDA_ACTIVIDAD || a.moneda_actividad;

            tabla.innerHTML += `
                <tr>
                    <td>${id ?? ""}</td>
                    <td>${nombre ?? ""}</td>
                    <td>${tipo ?? ""}</td>
                    <td>${fecha ?? ""}</td>
                    <td>${costo ?? ""}</td>
                    <td>${moneda ?? ""}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarActividad(${id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarActividad(${id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error cargando actividades:", error);
        const tabla = document.getElementById("tablaActividades");
        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No se pudieron cargar las actividades</td>
                </tr>
            `;
        }
    }
}

async function registrarActividad() {
    const actividad = obtenerDatosFormulario();

    if (!actividad.nombre_actividad || !actividad.fecha_actividad || !actividad.id_tip_actividad) {
        alert("Debe completar al menos nombre, fecha y tipo de actividad.");
        return;
    }

    try {
        const res = await fetch(API_ACTIVIDADES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actividad)
        });

        const raw = await res.text();
        console.log("POST respuesta RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON al registrar actividad:", e);
            alert("Error en la respuesta del servidor al registrar.");
            return;
        }

        alert(data.mensaje || "Actividad registrada correctamente");
        cargarActividades();
        limpiarFormulario();

    } catch (error) {
        console.error("Error registrando actividad:", error);
        alert("Ocurrió un error registrando la actividad");
    }
}

async function editarActividad(id) {
    try {
        const res = await fetch(API_ACTIVIDADES);
        const raw = await res.text();

        let actividades;
        try {
            actividades = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON al editar actividad:", e);
            alert("No se pudo cargar la actividad seleccionada");
            return;
        }

        if (actividades && Array.isArray(actividades.data)) {
            actividades = actividades.data;
        }

        const a = Array.isArray(actividades)
            ? actividades.find(x => (x.ID_ACTIVIDAD || x.id_actividad) == id)
            : null;

        if (!a) {
            alert("Actividad no encontrada");
            return;
        }

        document.getElementById("id_actividad").value = a.ID_ACTIVIDAD || a.id_actividad;
        document.getElementById("nombre_actividad").value = a.NOMBRE_ACTIVIDAD || a.nombre_actividad || "";
        document.getElementById("id_tipo_actividad").value = a.ID_TIP_ACTIVIDAD || a.id_tip_actividad || "";
        document.getElementById("fec_actividad").value = (a.FEC_ACTIVIDAD || a.FECHA_ACTIVIDAD || a.fec_actividad || "").substring(0, 10);
        document.getElementById("lugar_actividad").value = a.LUGAR_ACTIVIDAD || a.lugar_actividad || "";
        document.getElementById("hora_actividad").value = (a.HORA_ACTIVIDAD || a.hora_actividad || "").substring(0, 5);
        document.getElementById("id_tip_pago").value = a.ID_TIP_PAGO || a.id_tip_pago || "";
        document.getElementById("costo_actividad").value = a.COSTO_ACTIVIDAD || a.costo_actividad || "";
        document.getElementById("moneda_actividad").value = a.MONEDA_ACTIVIDAD || a.moneda_actividad || "";
        document.getElementById("id_cuenta_bco").value = a.ID_CUENTA_BCO || a.id_cuenta_bco || "";
        document.getElementById("descrip_actividad").value = a.DESCRIP_ACTIVIDAD || a.descrip_actividad || "";

    } catch (error) {
        console.error("Error cargando actividad:", error);
        alert("No se pudo cargar la actividad seleccionada");
    }
}

async function actualizarActividad() {
    const actividad = obtenerDatosFormulario();

    if (!actividad.id_actividad) {
        alert("Debe seleccionar una actividad primero");
        return;
    }

    if (!actividad.nombre_actividad || !actividad.fecha_actividad || !actividad.id_tip_actividad) {
        alert("Debe completar al menos nombre, fecha y tipo de actividad.");
        return;
    }

    try {
        const res = await fetch(API_ACTIVIDADES, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actividad)
        });

        const raw = await res.text();
        console.log("PUT respuesta RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON al actualizar actividad:", e);
            alert("Error en la respuesta del servidor al actualizar.");
            return;
        }

        alert(data.mensaje || "Actividad actualizada correctamente");
        cargarActividades();
        limpiarFormulario();

    } catch (error) {
        console.error("Error actualizando actividad:", error);
        alert("Ocurrió un error actualizando la actividad");
    }
}

async function eliminarActividad(id) {
    if (!confirm("¿Seguro que desea eliminar esta actividad?")) return;

    try {
        const res = await fetch(API_ACTIVIDADES, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_actividad: id })
        });

        const raw = await res.text();
        console.log("DELETE respuesta RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON al eliminar actividad:", e);
            alert("Error en la respuesta del servidor al eliminar.");
            return;
        }

        alert(data.mensaje || "Actividad eliminada correctamente");
        cargarActividades();

    } catch (error) {
        console.error("Error eliminando actividad:", error);
        alert("Ocurrió un error eliminando la actividad");
    }
}

function obtenerDatosFormulario() {
    return {
        id_actividad: document.getElementById("id_actividad").value,
        nombre_actividad: document.getElementById("nombre_actividad").value.trim(),
        id_tip_actividad: document.getElementById("id_tipo_actividad").value,
        fecha_actividad: document.getElementById("fec_actividad").value,
        lugar_actividad: document.getElementById("lugar_actividad").value.trim(),
        hora_actividad: document.getElementById("hora_actividad").value,
        id_tip_pago: document.getElementById("id_tip_pago").value,
        id_cuenta_bco: document.getElementById("id_cuenta_bco").value,
        costo_actividad: document.getElementById("costo_actividad").value || 0,
        moneda_actividad: document.getElementById("moneda_actividad").value,
        descrip_actividad: document.getElementById("descrip_actividad").value.trim()
    };
}

function limpiarFormulario() {
    const form = document.getElementById("formActividad");
    if (form) form.reset();
    const id = document.getElementById("id_actividad");
    if (id) id.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    cargarTiposActividad();
    cargarSocios();
    cargarTiposPago();
    cargarCuentasBancarias();
    cargarActividades();
});