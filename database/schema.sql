-- Café Gourmet - schema (MySQL 8+)
-- Inferido das queries em routes/ e middlewares/.
-- O banco (DB_NAME) é criado/selecionado por scripts/setup-db.mjs.

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome         VARCHAR(120) NOT NULL,
  email        VARCHAR(190) NOT NULL,
  senha        VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
  criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS produtos (
  id_produto      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(160) NOT NULL,
  descricao       TEXT NULL,
  descricao_curta VARCHAR(255) NULL,
  valor           DECIMAL(10,2) NOT NULL,
  imagem          VARCHAR(255) NOT NULL,
  estoque         INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_produto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- id_usuario = 0 representa o visitante (guest), por isso não há FK para usuarios.
CREATE TABLE IF NOT EXISTS carrinhos (
  id_carrinho INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario  INT UNSIGNED NOT NULL DEFAULT 0,
  ativo       TINYINT(1) NOT NULL DEFAULT 1,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_carrinho),
  KEY idx_carrinhos_usuario_ativo (id_usuario, ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carrinho_itens (
  id_item        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_carrinho    INT UNSIGNED NOT NULL,
  id_produto     INT UNSIGNED NOT NULL,
  quantidade     INT NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_item),
  UNIQUE KEY uq_carrinho_produto (id_carrinho, id_produto),
  CONSTRAINT fk_ci_carrinho FOREIGN KEY (id_carrinho) REFERENCES carrinhos (id_carrinho) ON DELETE CASCADE,
  CONSTRAINT fk_ci_produto  FOREIGN KEY (id_produto)  REFERENCES produtos (id_produto)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ordens (
  id_ordem   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL DEFAULT 0,
  total      DECIMAL(10,2) NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'pendente',
  criado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_ordem),
  KEY idx_ordens_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pagamentos (
  id_pagamento INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_ordem     INT UNSIGNED NOT NULL,
  metodo       VARCHAR(30) NOT NULL,
  valor        DECIMAL(10,2) NOT NULL,
  status       ENUM('pendente','confirmado','falhou') NOT NULL DEFAULT 'pendente',
  criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pagamento),
  CONSTRAINT fk_pag_ordem FOREIGN KEY (id_ordem) REFERENCES ordens (id_ordem) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ordem_itens (
  id_item        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_ordem       INT UNSIGNED NOT NULL,
  id_produto     INT UNSIGNED NOT NULL,
  quantidade     INT NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_item),
  KEY idx_oi_produto (id_produto),
  CONSTRAINT fk_oi_ordem FOREIGN KEY (id_ordem) REFERENCES ordens (id_ordem) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
