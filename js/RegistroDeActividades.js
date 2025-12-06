const API_ACTIVIDADES = "http://localhost/ClubdeLeones/api/RegistroDeActividades.php";

async function cargarActividades() {
    try {
        const res = await fetch(API_ACTIVIDADES);
        const data = await res.json();

        const tabla = document.getElementById("tablaActividades");
        tabla.innerHTML = "";

        data.forEach(a => {
            tabla.innerHTML += `
                <tr>
                    <td>${a.ID_ACTIVIDAD}</td>
                    <td>${a.NOMBRE_ACTIVIDAD}</td>
                    <td>${a.ID_TIPO_ACTIVIDAD}</td>
                    <td>${a.FEC_ACTIVIDAD}</td>
                    <td>${a.ID_SOCIO_RESP}</td>
                    <td>${a.OBJETIVO}</td>

                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarActividad(${a.ID_ACTIVIDAD})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarActividad(${a.ID_ACTIVIDAD})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error cargando actividades:", error);
    }
}

async function registrarActividad() {
    const actividad = obtenerDatosFormulario();

    try {
        const res = await fetch(API_ACTIVIDADES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actividad)
        });

        const data = await res.json();
        alert(data.mensaje);
        cargarActividades();
        limpiarFormulario();

    } catch (error) {
        console.error("Error registrando actividad:", error);
    }
}

async function editarActividad(id) {
    try {
        const res = await fetch(API_ACTIVIDADES);
        const actividades = await res.json();

        const a = actividades.find(x => x.ID_ACTIVIDAD == id);

        if (!a) {
            alert("Actividad no encontrada");
            return;
        }

        document.getElementById("id_actividad").value = a.ID_ACTIVIDAD;
        document.getElementById("nombre_actividad").value = a.NOMBRE_ACTIVIDAD;
        document.getElementById("id_tipo_actividad").value = a.ID_TIPO_ACTIVIDAD;
        document.getElementById("fec_actividad").value = a.FEC_ACTIVIDAD;
        document.getElementById("id_socio_responsable").value = a.ID_SOCIO_RESP;
        document.getElementById("objetivo_actividad").value = a.OBJETIVO;

    } catch (error) {
        console.error("Error cargando actividad:", error);
    }
}

async function actualizarActividad() {
    const actividad = obtenerDatosFormulario();

    if (!actividad.id_actividad) {
        alert("Debe seleccionar una actividad primero");
        return;
    }

    try {
        const res = await fetch(API_ACTIVIDADES, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actividad)
        });

        const data = await res.json();
        alert(data.mensaje);
        cargarActividades();
        limpiarFormulario();

    } catch (error) {
        console.error("Error actualizando actividad:", error);
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

        const data = await res.json();
        alert(data.mensaje);
        cargarActividades();

    } catch (error) {
        console.error("Error eliminando actividad:", error);
    }
}

function obtenerDatosFormulario() {
    return {
        id_actividad: document.getElementById("id_actividad").value,
        nombre_actividad: document.getElementById("nombre_actividad").value,
        id_tipo_actividad: document.getElementById("id_tipo_actividad").value,
        fec_actividad: document.getElementById("fec_actividad").value,
        id_socio_resp: document.getElementById("id_socio_responsable").value,
        objetivo_actividad: document.getElementById("objetivo_actividad").value
    };
}

function limpiarFormulario() {
    document.getElementById("formActividad").reset();
    document.getElementById("id_actividad").value = "";
}

document.addEventListener("DOMContentLoaded", cargarActividades);
