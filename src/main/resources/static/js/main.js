const formSuscripcion = document.getElementById("suscripcion");
const toastElement = document.getElementById("toastSuscripcion");

//Verificación de seguridad (Evita errores de 'null')
if (formSuscripcion && toastElement) {
    // Inicializamos el componente Toast de Bootstrap
    const bootstrapToast = new bootstrap.Toast(toastElement);

    formSuscripcion.addEventListener("submit", function(e) {
        e.preventDefault(); // Evita que la página se recargue
        
        bootstrapToast.show(); // Lanza la notificación elegante
        formSuscripcion.reset(); // Limpia el campo de email
    });
}