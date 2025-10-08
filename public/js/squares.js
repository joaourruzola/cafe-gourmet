const canvas = document.getElementById("squaresCanvas");
const ctx = canvas.getContext("2d");

let squareSize = 150;
let speed = 0.33;
let direction = "diagonal"; // pode ser: right, left, up, down, diagonal
let borderColor = "#99999934";
let hoverFillColor = "#222";

let numSquaresX, numSquaresY;
let gridOffset = { x: 0, y: 0 };
let hoveredSquare = null;

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	numSquaresX = Math.ceil(canvas.width / squareSize) + 1;
	numSquaresY = Math.ceil(canvas.height / squareSize) + 1;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function drawGrid() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
	const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

	for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
		for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
			const squareX = x - (gridOffset.x % squareSize);
			const squareY = y - (gridOffset.y % squareSize);

			if (
				hoveredSquare &&
				Math.floor((x - startX) / squareSize) === hoveredSquare.x &&
				Math.floor((y - startY) / squareSize) === hoveredSquare.y
			) {
				ctx.fillStyle = hoverFillColor;
				ctx.fillRect(squareX, squareY, squareSize, squareSize);
			}

			ctx.strokeStyle = borderColor;
			ctx.strokeRect(squareX, squareY, squareSize, squareSize);
		}
	}

	const gradient = ctx.createRadialGradient(
		canvas.width / 2,
		canvas.height / 2,
		0,
		canvas.width / 2,
		canvas.height / 2,
		Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
	);
	gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateAnimation() {
	const effectiveSpeed = Math.max(speed, 0.1);

	switch (direction) {
		case "right":
			gridOffset.x =
				(gridOffset.x - effectiveSpeed + squareSize) % squareSize;
			break;
		case "left":
			gridOffset.x =
				(gridOffset.x + effectiveSpeed + squareSize) % squareSize;
			break;
		case "up":
			gridOffset.y =
				(gridOffset.y + effectiveSpeed + squareSize) % squareSize;
			break;
		case "down":
			gridOffset.y =
				(gridOffset.y - effectiveSpeed + squareSize) % squareSize;
			break;
		case "diagonal":
			gridOffset.x =
				(gridOffset.x - effectiveSpeed + squareSize) % squareSize;
			gridOffset.y =
				(gridOffset.y - effectiveSpeed + squareSize) % squareSize;
			break;
	}

	drawGrid();
	requestAnimationFrame(updateAnimation);
}
updateAnimation();

canvas.addEventListener("mousemove", (event) => {
	const rect = canvas.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
	const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

	const hoveredSquareX = Math.floor(
		(mouseX + gridOffset.x - startX) / squareSize
	);
	const hoveredSquareY = Math.floor(
		(mouseY + gridOffset.y - startY) / squareSize
	);

	if (
		!hoveredSquare ||
		hoveredSquare.x !== hoveredSquareX ||
		hoveredSquare.y !== hoveredSquareY
	) {
		hoveredSquare = { x: hoveredSquareX, y: hoveredSquareY };
	}
});

canvas.addEventListener("mouseleave", () => {
	hoveredSquare = null;
});
