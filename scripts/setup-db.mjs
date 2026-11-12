// Cria o banco, as tabelas e os dados iniciais no MySQL local.
// Uso: npm run db:setup           (cria o que faltar; não apaga nada)
//      npm run db:setup -- --reset (apaga o banco DB_NAME e recria do zero)
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import * as bcrypt from "bcryptjs";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const {
	DB_HOST = "localhost",
	DB_PORT = "3306",
	DB_USER = "root",
	DB_PASSWORD = "",
	DB_NAME = "cafe_gourmet",
	ADMIN_EMAIL = "admin@cafegourmet.local",
	ADMIN_PASSWORD = "admin123",
} = process.env;

if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) {
	console.error("DB_NAME inválido (use apenas letras, números e _).");
	process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const sqlFile = (name) => readFile(path.join(dir, "..", "database", name), "utf8");
const reset = process.argv.includes("--reset");

let conn;
try {
	conn = await mysql.createConnection({
		host: DB_HOST,
		port: Number(DB_PORT),
		user: DB_USER,
		password: DB_PASSWORD,
		multipleStatements: true,
	});

	if (reset) {
		await conn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
		console.log(`Banco ${DB_NAME} removido.`);
	}

	await conn.query(
		`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
	);
	await conn.query(`USE \`${DB_NAME}\``);

	await conn.query(await sqlFile("schema.sql"));
	console.log("Tabelas OK.");

	const [[{ total }]] = await conn.query("SELECT COUNT(*) AS total FROM produtos");
	if (total === 0) {
		await conn.query(await sqlFile("seed.sql"));
		const [[{ n }]] = await conn.query("SELECT COUNT(*) AS n FROM produtos");
		console.log(`${n} produtos inseridos.`);
	} else {
		console.log(`Tabela produtos já tem ${total} registros; seed ignorado.`);
	}

	const [admins] = await conn.query("SELECT id_usuario FROM usuarios WHERE email = ?", [ADMIN_EMAIL]);
	if (admins.length === 0) {
		const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
		await conn.query(
			"INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, 'admin')",
			["Administrador", ADMIN_EMAIL, hash]
		);
		console.log(`Admin criado: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
	} else {
		console.log("Usuário admin já existe.");
	}

	console.log("Pronto! Rode: npm run dev");
} catch (err) {
	console.error("Falha ao configurar o banco:", err.message);
	process.exitCode = 1;
} finally {
	if (conn) await conn.end();
}
