/* ===========================
   Constantes y Product class
   =========================== */
const STORAGE_KEY = "products_json";
const SPACE_QUOTES = [
    "¡El universo es infinito!",
    "Marte podría ser nuestro próximo hogar.",
    "La Luna fue conquistada en 1969.",
    "Los satélites nos conectan con el mundo.",
    "Un traje espacial cuesta más de 10 millones de dólares."
];

class Product {
    constructor(name, description, price) {
        this.id = Date.now();
        this.name = name;
        this.description = description;
        this.price = Number(price);
    }
}

/* ===========================
   Estado
   =========================== */
let products = [];
let visitCount = 0;

/* ===========================
   Helpers
   =========================== */
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

/* ===========================
   Parallax base: mueve body::before con smoothing (requestAnimationFrame + lerp)
   - más suave, menor factor por defecto
   - evita repintes; GPU transform
   =========================== */
function setupStableBackgroundParallax() {
    let latestScroll = window.scrollY || window.pageYOffset;
    let targetScroll = latestScroll;
    let ticking = false;
    const factor = 0.18; // suavizado del movimiento del fondo

    function update() {
        latestScroll = lerp(latestScroll, targetScroll, 0.12); // lerp para suavizar
        const translateY = Math.round(latestScroll * factor);
        document.documentElement.style.setProperty('--bg-translate-y', `${translateY}px`);
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        targetScroll = window.scrollY || window.pageYOffset;
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    // init
    targetScroll = window.scrollY || window.pageYOffset;
    update();
}

function lerp(a, b, t) { return a + (b - a) * t; }

/* ===========================
   Parallax multilayer con pointer (mejor rendimiento y suavizado)
   - layers opcionales; ajusta factores para menos movimiento
   =========================== */
const PARALLAX = {
    enabled: true,
    pointerEnabled: true,
    pointerMaxOffset: 28,
    layers: [
        { selector: '.parallax-layer.layer-back', speed: 0.06, pointerMultiplier: 0.015 },
        { selector: '.parallax-layer.layer-mid', speed: 0.14, pointerMultiplier: 0.03 },
        { selector: '.parallax-layer.layer-front', speed: 0.26, pointerMultiplier: 0.05 }
    ],
    bodyFactor: 0.18,
    lerpFactor: 0.09
};

const _state = {
    scrollY: window.scrollY || window.pageYOffset,
    targetScrollY: window.scrollY || window.pageYOffset,
    pointerX: window.innerWidth / 2,
    pointerY: window.innerHeight / 2,
    targetPointerX: window.innerWidth / 2,
    targetPointerY: window.innerHeight / 2,
    raf: null
};

function initParallaxMultilayer() {
    if (!PARALLAX.enabled) return;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    const pointerActive = PARALLAX.pointerEnabled && !isTouch;

    if (pointerActive) {
        window.addEventListener('mousemove', (e) => {
            _state.targetPointerX = e.clientX;
            _state.targetPointerY = e.clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!e.touches || !e.touches[0]) return;
            _state.targetPointerX = e.touches[0].clientX;
            _state.targetPointerY = e.touches[0].clientY;
        }, { passive: true });
    }

    window.addEventListener('scroll', () => {
        _state.targetScrollY = window.scrollY || window.pageYOffset;
    }, { passive: true });

    const layerNodes = PARALLAX.layers.map(l => {
        const el = document.querySelector(l.selector);
        return { el, speed: l.speed, pointerMultiplier: l.pointerMultiplier };
    }).filter(x => x.el);

    function loop() {
        _state.scrollY = lerp(_state.scrollY, _state.targetScrollY, PARALLAX.lerpFactor);
        _state.pointerX = lerp(_state.pointerX, _state.targetPointerX, PARALLAX.lerpFactor);
        _state.pointerY = lerp(_state.pointerY, _state.targetPointerY, PARALLAX.lerpFactor);

        // Actualiza body background (mantiene sincronía)
        const bgTranslateY = Math.round(_state.scrollY * PARALLAX.bodyFactor);
        document.documentElement.style.setProperty('--bg-translate-y', `${bgTranslateY}px`);

        // Actualiza capas
        layerNodes.forEach((layer) => {
            const speed = layer.speed;
            const ptrMul = layer.pointerMultiplier;

            const ty = -(_state.scrollY * speed);

            const vw = Math.max(document.documentElement.clientWidth || 1, window.innerWidth || 1);
            const vh = Math.max(document.documentElement.clientHeight || 1, window.innerHeight || 1);
            const nx = (_state.pointerX / vw - 0.5) * 2;
            const ny = (_state.pointerY / vh - 0.5) * 2;

            const px = nx * PARALLAX.pointerMaxOffset * ptrMul;
            const py = ny * PARALLAX.pointerMaxOffset * ptrMul;

            const transform = `translate3d(${px}px, ${ty + py}px, 0) translateZ(0)`;
            layer.el.style.transform = transform;
        });

        _state.raf = requestAnimationFrame(loop);
    }

    // initialize state
    _state.targetScrollY = window.scrollY || window.pageYOffset;
    _state.scrollY = _state.targetScrollY;
    _state.targetPointerX = window.innerWidth / 2;
    _state.targetPointerY = window.innerHeight / 2;
    _state.pointerX = _state.targetPointerX;
    _state.pointerY = _state.targetPointerY;

    if (!_state.raf) _state.raf = requestAnimationFrame(loop);
}

/* ===========================
   Menú panel: toggle a la izquierda (icon), panel abre desde la izquierda
   - animaciones suaves y control de foco
   =========================== */
function setupMenu() {
    const toggle = document.getElementById("menu-toggle");
    const panel = document.getElementById("menu-panel");
    const closeBtn = document.getElementById("menu-close");

    if (!toggle || !panel) return;

    function openPanel() {
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        toggle.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
        // move focus into panel for accessibility
        requestAnimationFrame(() => {
            const firstLink = panel.querySelector("a");
            if (firstLink) firstLink.focus();
        });
    }
    function closePanel() {
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
    }

    toggle.addEventListener("click", () => panel.classList.contains("open") ? closePanel() : openPanel());
    if (closeBtn) closeBtn.addEventListener("click", closePanel);

    panel.querySelectorAll("a").forEach(a => a.addEventListener("click", closePanel));

    // close on click outside (desktop)
    document.addEventListener("click", (e) => {
        if (!panel.classList.contains("open")) return;
        const insidePanel = panel.contains(e.target);
        const isToggle = toggle.contains(e.target);
        if (!insidePanel && !isToggle) closePanel();
    });

    // close on Escape
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("open")) closePanel(); });
}

/* ===========================
   Galería, reloj, visitas, frases
   =========================== */
function setupImageAlerts() {
    document.querySelectorAll(".image-gallery img").forEach(img => {
        img.addEventListener("click", () => alert("Has seleccionado: " + img.alt));
    });
}
function showCurrentTime() { setText("clock", "Hora actual: " + new Date().toLocaleTimeString()); }
setInterval(showCurrentTime, 1000);
function countVisit() { visitCount++; setText("visit-counter", "Visitas: " + visitCount); }
function showSpaceQuote() { const idx = Math.floor(Math.random() * SPACE_QUOTES.length); alert(SPACE_QUOTES[idx]); }

/* ===========================
   CRUD productos + validación
   =========================== */
function loadProducts() {
    const raw = localStorage.getItem(STORAGE_KEY);
    products = raw ? JSON.parse(raw) : [];
}
function saveProducts() { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }
function renderProducts() {
    const list = document.getElementById("product-list");
    if (!list) return;
    list.innerHTML = "";
    products.forEach(p => {
        const li = document.createElement("li");
        li.className = "product-item";
        li.textContent = `${p.name} — ${p.description} — €${p.price.toFixed(2)}`;
        list.appendChild(li);
    });
}
function validateProductForm(name, description, price) {
    setText("product-name-error", ""); setText("product-description-error", ""); setText("product-price-error", "");
    let ok = true;
    if (name.trim().length < 2) { setText("product-name-error", "Nombre mínimo 2 caracteres."); ok = false; }
    if (description.trim().length < 5) { setText("product-description-error", "Descripción mínimo 5 caracteres."); ok = false; }
    if (isNaN(Number(price)) || Number(price) < 0) { setText("product-price-error", "Precio válido mayor o igual 0."); ok = false; }
    return ok;
}
function addProductHandler(e) {
    e.preventDefault();
    const name = (document.getElementById("product-name") || {}).value || "";
    const description = (document.getElementById("product-description") || {}).value || "";
    const price = (document.getElementById("product-price") || {}).value || "";
    if (!validateProductForm(name, description, price)) return;
    products.push(new Product(name.trim(), description.trim(), Number(price)));
    saveProducts(); renderProducts(); document.getElementById("product-form").reset();
}

/* ===========================
   Contact form validation
   =========================== */
function validateContactForm() {
    const name = (document.getElementById("name") || {}).value || "";
    const email = (document.getElementById("email") || {}).value || "";
    const phone = (document.getElementById("phone") || {}).value || "";
    const message = (document.getElementById("message") || {}).value || "";
    ["name-error", "email-error", "phone-error", "message-error"].forEach(id => setText(id, ""));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{7,15}$/;
    let valid = true;
    if (name.trim().length < 2) { setText("name-error", "Nombre mínimo 2 caracteres."); valid = false; }
    if (!emailRegex.test(email.trim())) { setText("email-error", "Correo inválido."); valid = false; }
    if (phone.trim() && !phoneRegex.test(phone.trim())) { setText("phone-error", "Teléfono inválido."); valid = false; }
    if (message.trim().length < 10) { setText("message-error", "Mensaje mínimo 10 caracteres."); valid = false; }
    return valid;
}

/* ===========================
   Save visitor name
   =========================== */
function saveVisitorName() {
    const n = (document.getElementById("name") || {}).value || "";
    if (n.trim().length >= 2) { localStorage.setItem("visitor", n.trim()); alert("¡Bienvenido, " + n.trim() + "!"); }
    else alert("Introduce un nombre válido para guardar.");
}

/* ===========================
   Inicialización
   =========================== */
window.addEventListener("DOMContentLoaded", () => {
    setupStableBackgroundParallax();  // base parallax del fondo
    initParallaxMultilayer();         // multicapa suave
    setupMenu();                      // menú toggle a la izquierda, panel abre a la izquierda
    setupImageAlerts();
    loadProducts(); renderProducts();
    countVisit(); showCurrentTime();

    document.getElementById("product-form")?.addEventListener("submit", addProductHandler);
    document.getElementById("contact-form")?.addEventListener("submit", (e) => {
        if (!validateContactForm()) e.preventDefault();
        else { e.preventDefault(); alert("Formulario válido (simulado)."); document.getElementById("contact-form").reset(); }
    });

    document.getElementById("info-button")?.addEventListener("click", () => {
        const extra = document.getElementById("extra-info");
        if (extra) extra.textContent = "La exploración espacial impulsa la innovación y el conocimiento humano.";
        extra?.classList.remove("hidden");
    });
    document.getElementById("phrase-button")?.addEventListener("click", showSpaceQuote);
    document.getElementById("save-name")?.addEventListener("click", saveVisitorName);
});
