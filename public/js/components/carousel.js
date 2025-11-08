const slides = document.querySelectorAll(".slide");
const track = document.querySelector(".carousel-track");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");
let currentSlide = 0;

// Variáveis para a lógica de Swipe
let touchStartX = 0;
let touchEndX = 0;
const minSwipeDistance = 75;

function updateTrack() {
	track.style.transform = `translateX(-${currentSlide * 33.33}%)`;
	slides.forEach((slide, i) => {
		slide.classList.toggle("active", i === currentSlide);
	});
}

// Próximo slide
function showNextSlide() {
	currentSlide = (currentSlide + 1) % slides.length;
	updateTrack();
}

// Slide anterior
function showPrevSlide() {
	currentSlide = (currentSlide - 1 + slides.length) % slides.length;
	updateTrack();
}

let slideInterval = setInterval(showNextSlide, 5000);

function resetInterval() {
	clearInterval(slideInterval);
	slideInterval = setInterval(showNextSlide, 5000);
}

nextBtn.addEventListener("click", () => {
	showNextSlide();
	resetInterval();
});

prevBtn.addEventListener("click", () => {
	showPrevSlide();
	resetInterval();
});

// =======================================================
// === LÓGICA DE SWIPE (TOQUE) ===
// =======================================================

track.addEventListener("touchstart", (e) => {
	touchStartX = e.touches[0].clientX;
});

track.addEventListener("touchend", (e) => {
	touchEndX = e.changedTouches[0].clientX;

	const difference = touchStartX - touchEndX;

	// Verifica se a distância é válida para um swipe
	if (Math.abs(difference) >= minSwipeDistance) {
		if (difference > 0) {
			showNextSlide();
		} else {
			showPrevSlide();
		}
		resetInterval();
	}
});
