const API_REGISTRO = '../api/crear_usuario.php';

document.addEventListener('DOMContentLoaded', () => {
  const formRegistro = document.getElementById('formRegistro');
  const regNombre    = document.getElementById('regNombre');
  const regCorreo    = document.getElementById('regCorreo');
  const regTelefono  = document.getElementById('regTelefono');
  const regClave     = document.getElementById('regClave');
  const regClave2    = document.getElementById('regClave2');

  if (!formRegistro) return;

  formRegistro.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const nombre   = regNombre.value.trim();
    const correo   = regCorreo.value.trim();
    const telefono = regTelefono.value.trim();
    const clave    = regClave.value.trim();
    const clave2   = regClave2.value.trim();

    if (!nombre || !correo || !clave || !clave2) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    if (clave !== clave2) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch(API_REGISTRO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correo,
          clave,
          telefono
        })
      });

      const data = await res.json();

      if (data.ok) {
        alert('Usuario creado correctamente. Ahora puede iniciar sesión.');
        window.location.href = 'login.html';
      } else {
        alert(data.mensaje || 'No se pudo crear el usuario');
      }
    } catch (err) {
      console.error(err);
      alert('Error al crear el usuario');
    }
  });
});