import dotenv from "dotenv";
import path from "path";
import Express from "express";
import connection from "./models/db.js";
import { engine } from "express-handlebars";
import fileUpload from "express-fileupload";
import { dirname } from "path";
import { fileURLToPath } from "url";
import indexRoute from "./routes/index.mjs";
import adminRoutes from "./routes/admin.mjs";
import cartRoutes from "./routes/cart.mjs";
import authRoutes from "./routes/auth.mjs";
import livereload from "livereload";
import connectLivereload from "connect-livereload";

dotenv.config();
const port = process.env.PORT || 8080;
const app = Express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public"));

app.use(fileUpload());

app.use(Express.json());
app.use(
	Express.urlencoded({
		extended: true,
	})
);

app.use(connectLivereload());
app.use(Express.static("public"));
app.use("./css", Express.static("./public/css"));
app.use("./js", Express.static("./public/js"));
app.use("/bootstrap", Express.static("./node_modules/bootstrap/dist"));
app.use("/", indexRoute);
app.use("/admin", adminRoutes);
app.use("/", cartRoutes);
app.use("/auth", authRoutes);

app.use((req, res, next) => {
	const error = new Error(`A rota ${req.originalUrl} não foi encontrada.`);
	error.status = 404;
	next(error);
});

app.use((err, req, res, next) => {
	const status = err.status || 500;
	const is404 = status === 404;

	console.error(`Erro ${status}: ${err.message}`);

	// Renderiza uma página de erro 404 ou 500, dependendo do status
	res.status(status).render(is404 ? "404" : "error", {
		layout: "main",
		pageTitle: is404 ? "Página Não Encontrada (404)" : "Erro Interno",
		errorMessage: err.message,
		// Garante que pelo menos o CSS base seja carregado para a página de erro
		pageStyles: ["/css/globals.css"],
	});
});

app.engine(
	"handlebars",
	engine({
		helpers: {
			formatCurrency(value) {
				if (typeof value !== "number") {
					value = parseFloat(value);
				}
				return value.toLocaleString("pt-BR", {
					style: "currency",
					currency: "BRL",
				});
			},
			disableIfNoStock: function (estoque) {
				// Se o estoque for 0, null, undefined, ou false, retorna a string 'disabled'
				if (!estoque || parseInt(estoque) <= 0) {
					return "disabled";
				}
				return "";
			},
		},
	})
);

app.set("view engine", "handlebars");
app.set("views", "./views");

connection.connect((err) => {
	err
		? console.error("Connection error:", err)
		: console.log("Connection success!");
});

app.listen(port, () => {
	console.log(`Server initialized in centerbeam.proxy.rlwy.net:${port}`);
});

// Atualiza o browser ao salvar arquivos
liveReloadServer.server.once("connection", () => {
	setTimeout(() => {
		liveReloadServer.refresh("/");
	}, 100);
});
