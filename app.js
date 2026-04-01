// ============================================================
//  FuerteAlMedio — app.js
//  Lógica del catálogo: render, filtros en cascada, modal, WhatsApp
// ============================================================

// (formato internacional sin + ni espacios)
const WHATSAPP_NUMERO = "59898233168";

// ── Estado global ──
const filtros = {
  tipo: "todos",
  marca: "todas",
  modelo: "todos"
};

// Estado del modal
const modalState = {
  producto: null,
  fotoIndex: 0,
  talleSeleccionado: null
};

// ── Referencias al DOM — catálogo ──
const grilla        = document.getElementById("grilla-productos");
const estadoVacio   = document.getElementById("estado-vacio");
const contador      = document.getElementById("contador-productos");
const listaMarcas   = document.getElementById("lista-marcas");
const listaModelos  = document.getElementById("lista-modelos");
const secModelos    = document.getElementById("filtro-modelos");

// ── Referencias al DOM — modal ──
const modalOverlay      = document.getElementById("modal");
const modalCerrar       = document.getElementById("modal-cerrar");
const modalFotoGrande   = document.getElementById("modal-foto-grande");
const modalMiniaturas   = document.getElementById("modal-miniaturas");
const modalPrev         = document.getElementById("modal-prev");
const modalNext         = document.getElementById("modal-next");
const modalMarca        = document.getElementById("modal-marca");
const modalNombre       = document.getElementById("modal-nombre");
const modalColorTipo    = document.getElementById("modal-color-tipo");
const modalPrecio       = document.getElementById("modal-precio");
const modalDescripcion  = document.getElementById("modal-descripcion");
const modalTalles       = document.getElementById("modal-talles");
const modalBtnWsp       = document.getElementById("modal-btn-whatsapp");

// ============================================================
//  RENDER DE CARDS
// ============================================================

function renderProductos(lista) {
  grilla.innerHTML = "";

  if (lista.length === 0) {
    estadoVacio.style.display = "block";
    contador.textContent = "";
    return;
  }

  estadoVacio.style.display = "none";
  contador.textContent = `${lista.length} producto${lista.length !== 1 ? "s" : ""}`;

  lista.forEach(p => {
    const thumb = Array.isArray(p.imagenes) && p.imagenes.length > 0
      ? p.imagenes[0]
      : "img/placeholder.jpg";

    const tipoTexto = p.tipo === "11" ? "Fútbol 11"
                    : p.tipo === "5"  ? "Fútbol 5"
                    : "Futsal / Sala";

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = p.id;
    card.innerHTML = `
      ${p.destacado ? '<span class="badge-destacado">⭐ Destacado</span>' : ""}
      <img class="card-imagen" src="${thumb}" alt="${p.marca} ${p.modelo}"
           onerror="this.style.background='#2a2a2a'" />
      <div class="card-body">
        <p class="card-marca">${p.marca}</p>
        <p class="card-nombre">${p.modelo}</p>
        <p class="card-color">${p.color} · ${tipoTexto}</p>
        <div class="card-footer">
          <button class="btn-ver" data-id="${p.id}">Ver →</button>
        </div>
      </div>
    `;
    grilla.appendChild(card);
  });

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      const prod = productos.find(p => p.id === id);
      if (prod) abrirModal(prod);
    });
  });
}

// ============================================================
//  MODAL — abrir, cerrar, navegar fotos, talles, WhatsApp
// ============================================================

function abrirModal(prod) {
  modalState.producto         = prod;
  modalState.fotoIndex        = 0;
  modalState.talleSeleccionado = null;

  const tipoTexto = prod.tipo === "11" ? "Fútbol 11"
                  : prod.tipo === "5"  ? "Fútbol 5"
                  : "Futsal / Sala";

  modalMarca.textContent     = prod.marca;
  modalNombre.textContent    = prod.modelo;
  modalColorTipo.textContent = `${prod.color} · ${tipoTexto}`;
  if (prod.tipo === "11") {
    modalColorTipo.textContent += "$6290";
  } else if (prod.tipo === "5" || prod.tipo === "sala") {
    modalColorTipo.textContent += "$5390";
  } else {
    modalPrecio.textContent = `$ Consultar precio`;
  }
  modalDescripcion.textContent = prod.descripcion || "Champión importado de calidad AAA.";

  const imagenes = Array.isArray(prod.imagenes) && prod.imagenes.length > 0
    ? prod.imagenes
    : ["img/placeholder.jpg"];

  renderFotos(imagenes);
  renderTallesModal(prod);

  modalBtnWsp.disabled = true;

  modalOverlay.classList.add("activo");
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  modalOverlay.classList.remove("activo");
  document.body.style.overflow = "";
  modalState.producto = null;
  modalState.talleSeleccionado = null;
}

function renderFotos(imagenes) {
  modalFotoGrande.src = imagenes[modalState.fotoIndex];
  modalFotoGrande.alt = "";

  modalMiniaturas.innerHTML = "";
  imagenes.forEach((src, i) => {
    const img = document.createElement("img");
    img.src       = src;
    img.className = `modal-miniatura${i === modalState.fotoIndex ? " activa" : ""}`;
    img.addEventListener("click", () => cambiarFoto(i));
    modalMiniaturas.appendChild(img);
  });

  const hayMas = imagenes.length > 1;
  modalPrev.style.display = hayMas ? "flex" : "none";
  modalNext.style.display = hayMas ? "flex" : "none";
}

function cambiarFoto(nuevoIndex) {
  const imagenes = modalState.producto.imagenes;
  modalState.fotoIndex = (nuevoIndex + imagenes.length) % imagenes.length;
  renderFotos(imagenes);
}

function renderTallesModal(prod) {
  modalTalles.innerHTML = "";
  prod.talles.forEach(t => {
    const btn = document.createElement("button");
    btn.className    = "talle-btn";
    btn.textContent  = t;
    btn.dataset.talle = t;

    btn.addEventListener("click", () => {
      const yaSeleccionado = modalState.talleSeleccionado === t;

      if (yaSeleccionado) {
        modalState.talleSeleccionado = null;
        btn.classList.remove("seleccionado");
        modalBtnWsp.disabled = true;
      } else {
        modalState.talleSeleccionado = t;
        modalTalles.querySelectorAll(".talle-btn").forEach(b => b.classList.remove("seleccionado"));
        btn.classList.add("seleccionado");
        modalBtnWsp.disabled = false;
      }
    });

    modalTalles.appendChild(btn);
  });
}

modalCerrar.addEventListener("click", cerrarModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});

modalPrev.addEventListener("click", (e) => {
  e.stopPropagation();
  cambiarFoto(modalState.fotoIndex - 1);
});

modalNext.addEventListener("click", (e) => {
  e.stopPropagation();
  cambiarFoto(modalState.fotoIndex + 1);
});

modalBtnWsp.addEventListener("click", () => {
  const prod  = modalState.producto;
  const talle = modalState.talleSeleccionado;
  if (!prod || !talle) return;

  const tipoTexto = prod.tipo === "11" ? "Fútbol 11"
                  : prod.tipo === "5"  ? "Fútbol 5"
                  : "Futsal / Sala";

  const mensaje = `Hola! Me interesan los ${prod.marca} ${prod.modelo} ${prod.color} (${tipoTexto}) en el talle ${talle}. ¿Tenés disponible?`;
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
});

// ============================================================
//  FILTROS
// ============================================================

function productosFiltrados() {
  return productos.filter(p => {
    const pasaTipo   = filtros.tipo   === "todos"  || p.tipo   === filtros.tipo;
    const pasaMarca  = filtros.marca  === "todas"  || p.marca  === filtros.marca;
    const pasaModelo = filtros.modelo === "todos"  || p.modelo === filtros.modelo;
    return pasaTipo && pasaMarca && pasaModelo;
  });
}

// ── Poblar marcas únicas (filtradas por tipo activo) ──
function poblarMarcas() {
  const base = filtros.tipo === "todos"
    ? productos
    : productos.filter(p => p.tipo === filtros.tipo);

  const marcas = [...new Set(base.map(p => p.marca))].sort();

  listaMarcas.innerHTML = `<li><button class="filtro-btn activo" data-filtro="marca" data-valor="todas">Todas</button></li>`;
  marcas.forEach(m => {
    listaMarcas.innerHTML += `<li><button class="filtro-btn" data-filtro="marca" data-valor="${m}">${m}</button></li>`;
  });
}

// ── Poblar modelos según marca activa (filtrados por tipo activo) ──
function poblarModelos(marca) {
  if (marca === "todas") {
    secModelos.style.display = "none";
    return;
  }

  const base = filtros.tipo === "todos"
    ? productos
    : productos.filter(p => p.tipo === filtros.tipo);

  const modelos = [...new Set(
    base.filter(p => p.marca === marca).map(p => p.modelo)
  )].sort();

  listaModelos.innerHTML = `<li><button class="filtro-btn activo" data-filtro="modelo" data-valor="todos">Todos</button></li>`;
  modelos.forEach(m => {
    listaModelos.innerHTML += `<li><button class="filtro-btn" data-filtro="modelo" data-valor="${m}">${m}</button></li>`;
  });

  secModelos.style.display = "block";
  asignarEventosFiltros();
}

// ── Marcar botón activo dentro de su grupo ──
function marcarActivo(btn) {
  const filtro = btn.dataset.filtro;
  document.querySelectorAll(`.filtro-btn[data-filtro="${filtro}"]`).forEach(b => {
    b.classList.remove("activo");
  });
  btn.classList.add("activo");
}

// ── Asignar eventos a todos los botones de filtro ──
function asignarEventosFiltros() {
  document.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const { filtro, valor } = btn.dataset;
      marcarActivo(btn);

      if (filtro === "tipo") {
        filtros.tipo   = valor;
        filtros.marca  = "todas";
        filtros.modelo = "todos";
        poblarMarcas();
        secModelos.style.display = "none";
        asignarEventosFiltros();
      }

      if (filtro === "marca") {
        filtros.marca  = valor;
        filtros.modelo = "todos";
        poblarModelos(valor);
      }

      if (filtro === "modelo") {
        filtros.modelo = valor;
      }

      renderProductos(productosFiltrados());
    });
  });
}

// ============================================================
//  INIT — arranca todo cuando carga la página
// ============================================================

function init() {
  productos.sort((a, b) => b.destacado - a.destacado);
  poblarMarcas();
  asignarEventosFiltros();
  renderProductos(productos);
}

init();


// ============================================================
//  BOTTOM SHEET DE FILTROS (móvil)
// ============================================================

const btnFiltrarMobile   = document.getElementById("btn-filtrar-mobile");
const sheetOverlay       = document.getElementById("filtros-sheet-overlay");
const filtrosSheet       = document.getElementById("filtros-sheet");
const sheetListaMarcas   = document.getElementById("sheet-lista-marcas");
const sheetListaModelos  = document.getElementById("sheet-lista-modelos");
const sheetSecModelos    = document.getElementById("sheet-filtro-modelos");
const sheetLimpiar       = document.getElementById("sheet-limpiar");
const sheetAplicar       = document.getElementById("sheet-aplicar");

function abrirSheet() {
  sincronizarSheet();
  sheetOverlay.classList.add("activo");
  filtrosSheet.classList.add("activo");
  document.body.style.overflow = "hidden";
}

function cerrarSheet() {
  sheetOverlay.classList.remove("activo");
  filtrosSheet.classList.remove("activo");
  document.body.style.overflow = "";
}

// Sincroniza el estado actual de los filtros al abrir el sheet
function sincronizarSheet() {
  // Marcas filtradas por tipo activo
  const base = filtros.tipo === "todos"
    ? productos
    : productos.filter(p => p.tipo === filtros.tipo);

  const marcas = [...new Set(base.map(p => p.marca))].sort();
  sheetListaMarcas.innerHTML = `<li><button class="filtro-btn${filtros.marca === "todas" ? " activo" : ""}" data-filtro="marca" data-valor="todas" data-sheet="true">Todas</button></li>`;
  marcas.forEach(m => {
    sheetListaMarcas.innerHTML += `<li><button class="filtro-btn${filtros.marca === m ? " activo" : ""}" data-filtro="marca" data-valor="${m}" data-sheet="true">${m}</button></li>`;
  });

  if (filtros.marca !== "todas") {
    poblarModelosSheet(filtros.marca);
  } else {
    sheetSecModelos.style.display = "none";
  }

  document.querySelectorAll("#sheet-lista-tipo .filtro-btn").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.valor === filtros.tipo);
  });

  asignarEventosSheet();
}

function poblarModelosSheet(marca) {
  // Modelos filtrados por tipo activo
  const base = filtros.tipo === "todos"
    ? productos
    : productos.filter(p => p.tipo === filtros.tipo);

  const modelos = [...new Set(
    base.filter(p => p.marca === marca).map(p => p.modelo)
  )].sort();

  sheetListaModelos.innerHTML = `<li><button class="filtro-btn${filtros.modelo === "todos" ? " activo" : ""}" data-filtro="modelo" data-valor="todos" data-sheet="true">Todos</button></li>`;
  modelos.forEach(m => {
    sheetListaModelos.innerHTML += `<li><button class="filtro-btn${filtros.modelo === m ? " activo" : ""}" data-filtro="modelo" data-valor="${m}" data-sheet="true">${m}</button></li>`;
  });

  sheetSecModelos.style.display = "block";
  asignarEventosSheet();
}

function asignarEventosSheet() {
  filtrosSheet.querySelectorAll(".filtro-btn[data-sheet]").forEach(btn => {
    const nuevo = btn.cloneNode(true);
    btn.replaceWith(nuevo);
    nuevo.addEventListener("click", () => {
      const { filtro, valor } = nuevo.dataset;

      filtrosSheet.querySelectorAll(`.filtro-btn[data-filtro="${filtro}"]`).forEach(b => b.classList.remove("activo"));
      nuevo.classList.add("activo");

      if (filtro === "tipo") {
        filtros.tipo   = valor;
        filtros.marca  = "todas";
        filtros.modelo = "todos";
        sincronizarSheet();
        return;
      }

      if (filtro === "marca") {
        filtros.marca  = valor;
        filtros.modelo = "todos";
        if (valor === "todas") {
          sheetSecModelos.style.display = "none";
        } else {
          poblarModelosSheet(valor);
        }
      }

      if (filtro === "modelo") filtros.modelo = valor;

      const n = productosFiltrados().length;
      sheetAplicar.textContent = `Ver ${n} resultado${n !== 1 ? "s" : ""}`;
    });
  });
}

// Limpiar filtros desde el sheet
sheetLimpiar.addEventListener("click", () => {
  filtros.tipo   = "todos";
  filtros.marca  = "todas";
  filtros.modelo = "todos";
  sheetSecModelos.style.display = "none";
  sincronizarSheet();
  sheetAplicar.textContent = `Ver ${productos.length} resultados`;
});

// Aplicar y cerrar
sheetAplicar.addEventListener("click", () => {
  sincronizarSidebar();
  renderProductos(productosFiltrados());
  cerrarSheet();
});

// Cerrar tocando el overlay
sheetOverlay.addEventListener("click", cerrarSheet);

// Abrir sheet
btnFiltrarMobile.addEventListener("click", abrirSheet);

// Sincroniza el sidebar desktop con el estado actual (para consistencia)
function sincronizarSidebar() {
  ["tipo", "marca", "modelo"].forEach(filtro => {
    const valor = filtros[filtro];
    document.querySelectorAll(`.filtro-btn:not([data-sheet])[data-filtro="${filtro}"]`).forEach(b => {
      b.classList.toggle("activo", b.dataset.valor === valor);
    });
  });
  if (filtros.marca !== "todas") poblarModelos(filtros.marca);
}