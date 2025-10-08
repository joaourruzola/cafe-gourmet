import path from "path";
import Express from "express";
import connection from "./models/db.js";
import { engine } from "express-handlebars";
import fileUpload from "express-fileupload";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import indexRoute from "./routes/index.mjs";
import livereload from "livereload";
import connectLivereload from "connect-livereload";

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
app.use("/bootstrap", Express.static("./node_modules/bootstrap/dist"));
app.use("/", indexRoute);

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
	console.log(`Server initialized in localhost:${port}`);
});

// Atualiza o browser ao salvar arquivos
liveReloadServer.server.once("connection", () => {
	setTimeout(() => {
		liveReloadServer.refresh("/");
	}, 100);
});
