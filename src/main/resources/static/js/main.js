// 1. MÓDULO DE CONTACTO (Formspree)
const formContacto = document.getElementById('contactForm');
const toastContactoEl = document.getElementById('toastContacto');
const msjContacto = document.getElementById('toastContactoMensaje');
const btnEnviar = document.getElementById("btnEnviar");

if (formContacto && toastContactoEl && btnEnviar) {
    const toastContacto = new bootstrap.Toast(toastContactoEl);
    
    formContacto.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validación de Bootstrap
        if (!formContacto.checkValidity()) {
            e.stopPropagation();
            formContacto.classList.add('was-validated');
            return; 
        }

        const data = new FormData(formContacto);
        const originalText = btnEnviar.innerHTML;
        
        // Estado de carga
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Enviando...';

        try {
            const response = await fetch(formContacto.action, {
                method: formContacto.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                msjContacto.innerHTML = `<i class="fa-solid fa-circle-check me-2 text-success"></i> ¡Mensaje enviado con éxito! Nos contactaremos pronto.`;
                formContacto.reset();
                formContacto.classList.remove('was-validated');
            } else {
                msjContacto.innerHTML = `<i class="fa-solid fa-circle-exclamation me-2 text-danger"></i> Error al enviar. Revisa la configuración.`;
            }
        } catch (error) {
            msjContacto.innerHTML = `<i class="fa-solid fa-circle-exclamation me-2 text-danger"></i> Error de conexión a internet.`;
        } finally {
            btnEnviar.innerHTML = originalText;
            toastContacto.show(); // Mostramos el Toast de contacto
        }
    });

// 2. MÓDULO DE SUSCRIPCIÓN FOOTER 
const formSuscripcion = document.getElementById('suscripcion');
const toastSuscripcionEl = document.getElementById('toastSuscripcion');

if (formSuscripcion && toastSuscripcionEl) {
    const toastSuscripcion = new bootstrap.Toast(toastSuscripcionEl);
    
    formSuscripcion.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue
        
        // Validación de Bootstrap
        if (!formSuscripcion.checkValidity()) {
            e.stopPropagation();
            formSuscripcion.classList.add('was-validated');
            return; 
        }

        // Solo es de muestra
        toastSuscripcion.show(); // Mostramos el Toast específico de suscripción
        formSuscripcion.reset();
        formSuscripcion.classList.remove('was-validated');
    });
}
    // ACTIVAR / DESACTIVAR BOTÓN
    formContacto.addEventListener("input", function() {

        if (formContacto.checkValidity()) {
            btnEnviar.disabled = false;
        } else {
            btnEnviar.disabled = true;
        }

    });

    // Estado inicial
    btnEnviar.disabled = true;
}