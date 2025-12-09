const API_LOGIN = '../api/login.php';
const API_RESET = '../api/cambiar_password.php';

document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('loginForm');
  const toggle = document.getElementById('togglePassword');
  const pwd    = document.getElementById('password');
  const user   = document.getElementById('username');

  const forgotLink   = document.getElementById('forgotPasswordLink');
  const resetForm    = document.getElementById('resetPasswordForm');
  const resetModalEl = document.getElementById('resetPasswordModal');
  const resetModal   = resetModalEl ? new bootstrap.Modal(resetModalEl) : null;

  // Ver / ocultar contraseña
  if (toggle && pwd) {
    toggle.addEventListener('click', () => {
      if (pwd.type === 'password') {
        pwd.type = 'text';
        toggle.textContent = '🙈';
        toggle.title = 'Ocultar contraseña';
      } else {
        pwd.type = 'password';
        toggle.textContent = '👁️';
        toggle.title = 'Mostrar contraseña';
      }
    });
  }

  // Login
  if (form && user && pwd) {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      const usuario  = user.value.trim();
      const password = pwd.value.trim();

      if (!usuario || !password) {
        form.classList.add('was-validated');
        return;
      }

      try {
        const res = await fetch(API_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, password })
        });

        const data = await res.json();

        if (data.ok) {
          sessionStorage.setItem('usuario', data.usuario || usuario);
          window.location.href = 'menu_socio.html';
        } else {
          alert(data.mensaje || 'Usuario o contraseña incorrectos');
        }
      } catch (err) {
        alert('No se pudo validar el usuario en este momento');
      }
    });
  }

  // Olvidé contraseña -> abrir modal
  if (forgotLink && resetModal) {
    forgotLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (resetForm) resetForm.reset();
      resetModal.show();
    });
  }

  // Guardar nueva contraseña
  if (resetForm) {
    resetForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      const email = document.getElementById('resetEmail').value.trim();
      const pass1 = document.getElementById('resetPass1').value.trim();
      const pass2 = document.getElementById('resetPass2').value.trim();

      if (!email || !pass1 || !pass2) {
        alert('Complete todos los campos');
        return;
      }

      if (pass1 !== pass2) {
        alert('Las contraseñas no coinciden');
        return;
      }

      try {
        const res = await fetch(API_RESET, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo: email, clave: pass1 })
        });

        const data = await res.json();

        if (data.ok) {
          alert('Contraseña actualizada correctamente. Ahora puede iniciar sesión.');
          resetModal.hide();
        } else {
          alert(data.mensaje || 'No se pudo actualizar la contraseña');
        }
      } catch (err) {
        alert('Error al comunicarse con el servidor');
      }
    });
  }
});