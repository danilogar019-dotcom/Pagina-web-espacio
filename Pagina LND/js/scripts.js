// Toggle extra information visibility
function toggleInfo() {
    const extraInfo = document.getElementById("extra-info");
    extraInfo.classList.toggle("hidden");
}

// Highlight left panel on click
function highlightMissions() {
    const leftPanel = document.getElementById("main-container-item-left");
    if (leftPanel) {
        leftPanel.style.backgroundColor = "#003344";
    }
}

// Change gallery title on hover
function changeGalleryTitle() {
    const galleryTitle = document.querySelector("#main-container-item-middle h2");
    if (galleryTitle) {
        galleryTitle.textContent = "¡Explora el universo!";
    }
}

// Reset gallery title on mouse out
function resetGalleryTitle() {
    const galleryTitle = document.querySelector("#main-container-item-middle h2");
    if (galleryTitle) {
        galleryTitle.textContent = "Galería";
    }
}

// Show alert when clicking an image
function setupImageAlerts() {
    const images = document.querySelectorAll(".image-gallery img");
    images.forEach((img) => {
        img.addEventListener("click", () => {
            alert("Has seleccionado: " + img.alt);
        });
    });
}

// Show random space phrase
function showSpaceQuote() {
    const SPACE_QUOTES = [
        "¡El universo es infinito!",
        "Marte podría ser nuestro próximo hogar.",
        "La Luna fue conquistada en 1969.",
        "Los satélites nos conectan con el mundo.",
        "Un traje espacial cuesta más de 10 millones de dólares.",
    ];
    const index = Math.floor(Math.random() * SPACE_QUOTES.length);
    alert(SPACE_QUOTES[index]);
}

// Simulate visit counter
let visitCount = 0;
function countVisit() {
    visitCount++;
    const counter = document.getElementById("contador");
    if (counter) {
        counter.textContent = "Visitas: " + visitCount;
    }
}

// Show current time in real time
function showCurrentTime() {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const clock = document.getElementById("reloj");
    if (clock) {
        clock.textContent = "Hora actual: " + time;
    }
}
setInterval(showCurrentTime, 1000);

// Save visitor name
function saveVisitorName() {
    const name = document.getElementById("name").value.trim();
    if (name.length > 0) {
        localStorage.setItem("visitor", name);
        alert("¡Bienvenido, " + name + "!");
    }
}

// Validate contact form
function validateForm() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();

    if (name.length < 2) {
        alert("Por favor, introduce un nombre válido.");
        return false;
    }

    if (!email.includes("@")) {
        alert("Por favor, introduce un correo válido.");
        return false;
    }

    return true;
}

// Setup hamburger menu toggle
function setupMenuToggle() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu-options");

    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            menu.classList.toggle("hidden");
        });

        const links = menu.querySelectorAll("a");
        links.forEach((link) => {
            link.addEventListener("click", () => {
                menu.classList.add("hidden");
            });
        });
    }
}

// Initialize all interactions on page load
window.addEventListener("DOMContentLoaded", () => {
    setupImageAlerts();
    countVisit();
    showCurrentTime();
    setupMenuToggle();

    const gallerySection = document.getElementById("main-container-item-middle");
    if (gallerySection) {
        gallerySection.addEventListener("mouseover", changeGalleryTitle);
        gallerySection.addEventListener("mouseout", resetGalleryTitle);
    }

    const leftPanel = document.getElementById("main-container-item-left");
    if (leftPanel) {
        leftPanel.addEventListener("click", highlightMissions);
    }

    const rightPanel = document.getElementById("main-container-item-right");
    if (rightPanel) {
        rightPanel.addEventListener("dblclick", showSpaceQuote);
    }
});
