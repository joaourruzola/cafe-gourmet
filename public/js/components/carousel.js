document.addEventListener("DOMContentLoaded", () => {
	const track = document.querySelector(".carousel-track");
	const slides = document.querySelectorAll(".slide");
	const prevBtn = document.querySelector(".carousel-btn.prev");
	const nextBtn = document.querySelector(".carousel-btn.next");

	if (!track || slides.length === 0) return;

	const firstClone = slides[0].cloneNode(true);
	const lastClone = slides[slides.length - 1].cloneNode(true);

	firstClone.classList.add("clone");
	lastClone.classList.add("clone");

	track.appendChild(firstClone);
	track.prepend(lastClone);

	const allSlides = document.querySelectorAll(".slide");
	const slideCount = allSlides.length;

	// ----- CORREÇÃO DO BUG 3 INICIA AQUI -----

	// Cada slide ocupa 20% do trilho (que tem 500%)
	const slideWidthPercentage = 20;

	let currentSlide = 1;
	let isTransitioning = false;

	// Função para mover
	const updateTrackPosition = (withAnimation = true) => {
		if (withAnimation) {
			track.style.transition = "transform 0.5s ease-in-out";
		} else {
			track.style.transition = "none";
		}
		// A lógica agora usará 20%
		track.style.transform = `translateX(-${
			currentSlide * slideWidthPercentage
		}%)`;
	};

	// posição inicial (translateX(-20%))
	updateTrackPosition(false);

	function showNextSlide() {
		if (isTransitioning) return;
		isTransitioning = true;
		currentSlide++;
		updateTrackPosition(true);
	}

	function showPrevSlide() {
		if (isTransitioning) return;
		isTransitioning = true;
		currentSlide--;
		updateTrackPosition(true);
	}

	// transição para slide real sem animação
	track.addEventListener("transitionend", () => {
		// Se chegamos ao clone do primeiro slide (no final)
		if (currentSlide === slideCount - 1) {
			currentSlide = 1; // Pula para o primeiro slide real
			updateTrackPosition(false);
		}

		// Se chegamos ao clone do último slide (no início)
		if (currentSlide === 0) {
			currentSlide = slides.length;
			updateTrackPosition(false);
		}

		isTransitioning = false;
	});

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

	// Swipe
	let touchStartX = 0;
	let touchEndX = 0;
	const minSwipeDistance = 75;

	track.addEventListener(
		"touchstart",
		(e) => {
			if (isTransitioning) return;
			touchStartX = e.touches[0].clientX;
			clearInterval(slideInterval);
		},
		{ passive: true }
	);

	track.addEventListener(
		"touchend",
		(e) => {
			if (isTransitioning) return;
			touchEndX = e.changedTouches[0].clientX;
			const difference = touchStartX - touchEndX;

			if (Math.abs(difference) >= minSwipeDistance) {
				if (difference > 0) {
					showNextSlide();
				} else {
					showPrevSlide();
				}
			}
			resetInterval();
		},
		{ passive: true }
	);
});
