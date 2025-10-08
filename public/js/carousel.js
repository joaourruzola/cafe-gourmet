const slides = document.querySelectorAll(".slide");
const track = document.querySelector(".carousel-track");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");
let currentSlide = 0;

// Atualiza a posição do track
function updateTrack() {
	track.style.transform = `translateX(-${currentSlide * 33}%)`;
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

// Eventos dos botões
nextBtn.addEventListener("click", () => {
	showNextSlide();
	resetInterval();
});

prevBtn.addEventListener("click", () => {
	showPrevSlide();
	resetInterval();
});

// Intervalo automático
let slideInterval = setInterval(showNextSlide, 8000);

// Reinicia o intervalo ao clicar nos botões
function resetInterval() {
	clearInterval(slideInterval);
	slideInterval = setInterval(showNextSlide, 8000);
}
