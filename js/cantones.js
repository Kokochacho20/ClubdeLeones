const API_BASE = '../api';


document.addEventListener('DOMContentLoaded', function () {
    const formCanton = document.getElementById('form-canton');
    const tbodyCantones = document.getElementById('tbody-cantones');
    const btnGuardar = document.querySelector('#form-canton button[type="submit"]');
    const selectProvincia = document.getElementById('cod_provincia');
    let cantones = [];

    cargarProvincias();
    cargarCantones();

    formCanton.addEventListener('submit', function (e) {
        e.preventDefault();
        guardarCanton();
    });

    // Función para cargar las provincias en el select
    async function cargarProvincias() {
        try {
            const response = await fetch(`${API_BASE}/provincias.php`);
            if (!response.ok) {
                throw new Error('Error al cargar las provincias');
            }
            const provincias = await response.json();

            selectProvincia.innerHTML = '<option value="" selected disabled>Seleccione una provincia...</option>';

            // Llenar select provincias
            provincias.forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia.COD_PROVINCIA;
                option.textContent = provincia.NOMBRE_PROVINCIA;
                selectProvincia.appendChild(option);
            });

        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cargar las provincias', 'danger');
        }
    }

    // Función para cargar los cantones
    async function cargarCantones() {
        try {
            const response = await fetch(`${API_BASE}/cantones.php`);
            if (!response.ok) {
                throw new Error('Error al cargar los cantones');
            }
            cantones = await response.json();
            mostrarCantones(cantones);
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cargar los cantones', 'danger');
        }
    }

    // Función para mostrar los cantones en la tabla
    function mostrarCantones(cantones) {
        tbodyCantones.innerHTML = '';
        cantones.forEach(canton => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${canton.cod_canton}</td>
                <td>${canton.nombre_canton}</td>
                <td>${canton.nombre_provincia}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-2" onclick="editarCanton(${canton.cod_canton})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarCanton(${canton.cod_canton})">Eliminar</button>
                </td>
            `;
            tbodyCantones.appendChild(tr);
        });
    }

    // Función para guardar un nuevo canton o actualizar uno existente
    async function guardarCanton() {
        const codCanton = document.getElementById('cod_canton').value;
        const nombreCanton = document.getElementById('nombre_canton').value.trim();
        const codProvincia = document.getElementById('cod_provincia').value;

        if (!nombreCanton || !codProvincia) {
            mostrarAlerta('Por favor complete todos los campos', 'warning');
            return;
        }

        const canton = {
            nombre_canton: nombreCanton,
            cod_provincia: codProvincia
        };
        try {
            const url = codCanton
                ? `${API_BASE}/cantones.php?id=${codCanton}`
                : `${API_BASE}/cantones.php`;
            const method = codCanton ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(canton)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar el canton');
            }

            mostrarAlerta(`canton ${codCanton ? 'actualizado' : 'creado'} correctamente`, 'success');
            formCanton.reset();
            document.getElementById('cod_canton').value = '';
            btnGuardar.textContent = 'Guardar';
            cargarCantones();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta(error.message || 'Error al guardar el canton', 'danger');
        }
    }

    // editar canton
    window.editarCanton = async function (codCanton) {
        try {
            const response = await fetch(`${API_BASE}/cantones.php?id=${codCanton}`);
            if (!response.ok) {
                throw new Error('Error al cargar el canton');
            }
            const canton = await response.json();

            document.getElementById('cod_canton').value = canton.cod_canton;
            document.getElementById('nombre_canton').value = canton.nombre_canton;
            document.getElementById('cod_provincia').value = canton.cod_provincia;
            btnGuardar.textContent = 'Actualizar';

            document.getElementById('form-canton').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cargar el canton para editar', 'danger');
        }
    };

    // eliminar canton
    window.eliminarCanton = async function (codCanton) {
        if (!confirm('¿Está seguro de eliminar este canton?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/cantones.php?id=${codCanton}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar el canton');
            }

            mostrarAlerta('canton eliminado correctamente', 'success');
            cargarCantones();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta(error.message || 'No se pudo eliminar el canton', 'danger');
        }
    };

    function mostrarAlerta(mensaje, tipo) {
        const alertaAnterior = document.querySelector('.alert');
        if (alertaAnterior) {
            alertaAnterior.remove();
        }

        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show mt-3`;
        alerta.role = 'alert';
        alerta.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.querySelector('main');
        container.insertBefore(alerta, container.firstChild);

        setTimeout(() => {
            if (alerta.parentNode === container) {
                alerta.remove();
            }
        }, 5000);
    }
});