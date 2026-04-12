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

    // ACTIVAR / DESACTIVAR BOTÓN
    formContacto.addEventListener("input", function() {
        formContacto.classList.add('was-validated'); // Agrega clase para mostrar validación

        if (formContacto.checkValidity()) {
            btnEnviar.disabled = false;
        } else {
            btnEnviar.disabled = true;
        }

    });

    // Estado inicial
    btnEnviar.disabled = true;
}


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
    
// =============================
// CATÁLOGO
// =============================

document.addEventListener("DOMContentLoaded", () => {

  // ELEMENTOS
  const productos = document.querySelectorAll(".producto");

  const categorias = document.querySelectorAll(".filtro-cat");
  const estados = document.querySelectorAll(".filtro-estado");
  const tallas = document.querySelectorAll(".filtro-talla");

  const precioRange = document.getElementById("precioRange");
  const precioValor = document.getElementById("precioValor");

  const btnFiltro = document.getElementById("btnFiltro");
  const panelFiltro = document.getElementById("panelFiltro");
  const cerrarFiltro = document.getElementById("cerrarFiltro");
  const overlay = document.getElementById("overlay");

  const verTodo = document.getElementById("verTodo");

  let tallaSeleccionada = null;

  
  if (!btnFiltro || !panelFiltro) return;

  // =============================
  // PANEL FILTRO
  // =============================

  btnFiltro.addEventListener("click", () => {
    panelFiltro.classList.add("active");
    overlay.classList.add("active");
  });

  cerrarFiltro.addEventListener("click", cerrarTodo);
  overlay.addEventListener("click", cerrarTodo);

  function cerrarTodo() {
    panelFiltro.classList.remove("active");
    overlay.classList.remove("active");
  }

  // =============================
  // VER TODO
  // =============================

  verTodo.addEventListener("change", () => {

    if (verTodo.checked) {

      // desactiva categorías
      categorias.forEach(c => {
        if (c !== verTodo) c.checked = false;
      });

      // limpia estado
      estados.forEach(e => e.checked = false);

      // limpia talla
      tallaSeleccionada = null;
      tallas.forEach(b => b.classList.remove("active"));

      // resetea precio
      precioRange.value = 600;
      precioValor.textContent = "$600";

      // muestra todo
      productos.forEach(p => p.style.display = "block");
    }
  });

  // =============================
  // PRECIO
  // =============================

  precioRange.addEventListener("input", () => {
    precioValor.textContent = "$" + precioRange.value;

    // desactiva "ver todo"
    verTodo.checked = false;

    filtrar();
  });

  // =============================
  // TALLAS
  // =============================

  tallas.forEach(btn => {
    btn.addEventListener("click", () => {

      // toggle selección
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        tallaSeleccionada = null;
      } else {
        tallas.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        tallaSeleccionada = btn.dataset.talla;
      }

      verTodo.checked = false;

      filtrar();
    });
  });

  // =============================
  // CHECKBOXES
  // =============================

  [...categorias, ...estados].forEach(input => {
    input.addEventListener("change", () => {

      if (input !== verTodo) {
        verTodo.checked = false;
      }

      filtrar();
    });
  });

  // =============================
  // FILTRAR
  // =============================

  function filtrar() {

    // si está "ver todo"
    if (verTodo.checked) {
      productos.forEach(p => p.style.display = "block");
      return;
    }

    const cats = [...categorias]
      .filter(c => c.checked && c.value !== "todo")
      .map(c => c.value);

    const ests = [...estados]
      .filter(e => e.checked)
      .map(e => e.value);

    const precioMax = parseInt(precioRange.value);

    productos.forEach(producto => {

      const card = producto.querySelector(".card");

      const cat = card.dataset.categoria;
      const talla = card.dataset.talla;
      const estado = card.dataset.estado;
      const precio = parseInt(card.dataset.precio);

      let visible = true;

      // categoría
      if (cats.length && !cats.includes(cat)) visible = false;

      // estado
      if (ests.length && !ests.includes(estado)) visible = false;

      // talla
      if (tallaSeleccionada && talla !== tallaSeleccionada) visible = false;

      // precio
      if (precio > precioMax) visible = false;

      producto.style.display = visible ? "block" : "none";
    });

    //Contador de resultados de productos
      const visibles = [...productos].filter(p => p.style.display !== 'none').length;
    // 2. Buscamos el ID del HTML y le pasamos el número que contamos
    const contadorBadge = document.getElementById('contador-productos');
    if (contadorBadge) {
    contadorBadge.textContent = visibles;
    }
  }

});

// ==========================================
// 6. ADMINISTRADOR
// ==========================================

//Intercatividad de la tabla
document.addEventListener("DOMContentLoaded", () => {
    
    const tablaBody = document.querySelector('tbody'); 
    const btnEditar = document.getElementById('btnEditar');
    const btnEliminar = document.getElementById('btnEliminar');
    
    // Elementos del Modal
    const modalEliminarHTML = document.getElementById('modalConfirmarEliminar');
    const btnBorrarDefinitivo = document.getElementById('btnBorrarDefinitivo');

    // Elemento del Toast
    const toastEliminarEl = document.getElementById('toastEliminar');

    if (tablaBody && btnEditar && btnEliminar && modalEliminarHTML && toastEliminarEl) {
        
        // Inicializamos las herramientas de Bootstrap
        const modalBootstrap = new bootstrap.Modal(modalEliminarHTML);
        const toastBootstrap = new bootstrap.Toast(toastEliminarEl);

        // 1. Encender/Apagar botones
        tablaBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('producto-check')) {
                const marcados = document.querySelectorAll('.producto-check:checked');
                btnEliminar.disabled = marcados.length === 0;
                btnEditar.disabled = marcados.length !== 1;
            }
        });

        // 2. Mostrar Modal de confirmación
        btnEliminar.addEventListener('click', () => {
            modalBootstrap.show();
        });

        // 3. Acción REAL de borrar
        btnBorrarDefinitivo.addEventListener('click', () => {
            const marcados = document.querySelectorAll('.producto-check:checked');
            
            marcados.forEach(checkbox => {
                checkbox.closest('tr').remove();
            });

            btnEliminar.disabled = true;
            btnEditar.disabled = true;

            // Ocultamos el Modal
            modalBootstrap.hide();

            // Lanzamos el Toast
            toastBootstrap.show();
        });
    }
});