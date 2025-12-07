const API_SOCIOS = "http://localhost/ClubdeLeones/api/RegistroDeSocios.php";

async function cargarSocios() {
    try {
        const res = await fetch(API_SOCIOS);
        const data = await res.json();

        let tabla = document.getElementById("tablaSocios");
        tabla.innerHTML = "";

        data.forEach(s => {
            tabla.innerHTML += `
                <tr>
                    <td>${s.ID_SOCIO}</td>
                    <td>${s.CEDULA_SOCIO || ""}</td>
                    <td>${s.NOMBRE_SOCIO} ${s.APELLIDO1_SOCIO || ""} ${s.APELLIDO2_SOCIO || ""}</td>
                    <td>${s.CORREO || ""}</td>
                    <td>${s.ID_TIPO_SOCIO}</td>
                    <td>${s.ID_ESTADO_SOCIO}</td>
                    <td>${s.TELEFONO1}</td>

                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarSocio(${s.ID_SOCIO})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarSocio(${s.ID_SOCIO})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("Error cargando socios:", err);
    }
}

async function registrarSocio() {
    const socio = obtenerDatosFormulario();

    try {
        const res = await fetch(API_SOCIOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(socio)
        });

        const json = await res.json();
        alert(json.mensaje);
        cargarSocios();
        limpiarFormulario();

    } catch (err) {
        console.error("Error registrando socio:", err);
    }
}

async function editarSocio(id) {
    try {
        const res = await fetch(API_SOCIOS);
        const data = await res.json();

        const s = data.find(x => x.ID_SOCIO == id);

        if (!s) {
            alert("No se encontró el socio");
            return;
        }

        document.getElementById("id_socio").value = s.ID_SOCIO;
        document.getElementById("cedula_socio").value = s.CEDULA_SOCIO;
        document.getElementById("id_tipo_socio").value = s.ID_TIPO_SOCIO;
        document.getElementById("id_estado_socio").value = s.ID_ESTADO_SOCIO;

        document.getElementById("nombre_socio").value = s.NOMBRE_SOCIO;
        document.getElementById("apellido1_socio").value = s.APELLIDO1_SOCIO;
        document.getElementById("apellido2_socio").value = s.APELLIDO2_SOCIO;

        document.getElementById("fec_nacimiento").value = s.FEC_NACIMIENTO;
        document.getElementById("genero").value = s.GENERO;
        document.getElementById("estado_civil").value = s.ESTADO_CIVIL;
        document.getElementById("profesion").value = s.PROFESION;

        document.getElementById("telefono1").value = s.TELEFONO1;
        document.getElementById("telefono2").value = s.TELEFONO2;
        document.getElementById("correo_electronico").value = s.CORREO;
        document.getElementById("id_distrito").value = s.ID_DISTRITO;
        document.getElementById("direccion_exacta").value = s.DIRECCION;

    } catch (err) {
        console.error("Error al editar socio:", err);
    }
}

async function actualizarSocio() {
    const socio = obtenerDatosFormulario();

    if (!socio.id_socio) {
        alert("Debe seleccionar un socio para modificarlo");
        return;
    }

    try {
        const res = await fetch(API_SOCIOS, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(socio)
        });

        const json = await res.json();
        alert(json.mensaje);
        cargarSocios();
        limpiarFormulario();

    } catch (err) {
        console.error("Error actualizando socio:", err);
    }
}

async function eliminarSocio(id) {
    if (!confirm("¿Seguro que desea eliminar este socio?")) return;

    try {
        const res = await fetch(API_SOCIOS, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_socio: id })
        });

        const json = await res.json();
        alert(json.mensaje);
        cargarSocios();

    } catch (err) {
        console.error("Error eliminando socio:", err);
    }
}

function obtenerDatosFormulario() {
    return {
        id_socio: document.getElementById("id_socio").value,
        cedula_socio: document.getElementById("cedula_socio").value,
        id_tipo_socio: document.getElementById("id_tipo_socio").value,
        id_estado_socio: document.getElementById("id_estado_socio").value,

        nombre_socio: document.getElementById("nombre_socio").value,
        apellido1_socio: document.getElementById("apellido1_socio").value,
        apellido2_socio: document.getElementById("apellido2_socio").value,

        fec_nacimiento: document.getElementById("fec_nacimiento").value,
        genero: document.getElementById("genero").value,
        estado_civil: document.getElementById("estado_civil").value,
        profesion: document.getElementById("profesion").value,

        telefono1: document.getElementById("telefono1").value,
        telefono2: document.getElementById("telefono2").value,
        correo_electronico: document.getElementById("correo_electronico").value,
        id_distrito: document.getElementById("id_distrito").value,
        direccion_exacta: document.getElementById("direccion_exacta").value
    };
}

function limpiarFormulario() {
    document.querySelector("form").reset();
    document.getElementById("id_socio").value = "";
}

document.addEventListener("DOMContentLoaded", cargarSocios);


