# ☕ Café Gourmet 

Um e-commerce elegante e funcional para a venda de cafés especiais, desenvolvido utilizando o stack **Node.js, Express.js** e **Handlebars**, com **MySQL** como banco de dados.

## ⚙️ Tecnologias Utilizadas

Este projeto foi construído sobre uma pilha de tecnologias **JavaScript** e ferramentas focadas em performance e usabilidade:

| Categoria | Tecnologia | Função |
| :--- | :--- | :--- |
| **Backend** | **Node.js** | Ambiente de execução JavaScript *backend*. |
| **Backend** | **Express.js** | Framework robusto e minimalista para roteamento e gestão de *middlewares*. |
| **Backend** | **bcryptjs** | Biblioteca para criptografia e comparação segura de senhas. |
| **Backend** | **jsonwebtoken (JWT)** | Implementação de autenticação baseada em *tokens* (JSON Web Tokens). |
| **Frontend & Templating** | **Express-Handlebars** | Motor de *templates* para renderização de páginas HTML dinâmicas. |
| **Frontend & Templating** | **Bootstrap** | Frameworks CSS utilizados para um *design* responsivo e moderno. |
| **Banco de Dados** | **MySQL2** | Driver oficial para conexão com o banco de dados MySQL. |
| **Utilidades** | **dotenv** | Gerenciamento seguro de variáveis de ambiente. |
| **Utilidades** | **express-fileupload** | Facilita o *upload* e tratamento de arquivos (como imagens de produtos). |
| **Utilidades** | **cookie-parser** | Faz o *parse* de cookies HTTP para autenticação e sessões. |
| **Utilidades** | **qrcode** | Implementação de geração de códigos QR (ex: pagamentos). |
| **Utilidades** | **nodemon** | Reinicia automaticamente o servidor durante o desenvolvimento. |
| **Desenvolvimento / Live Reload** | **livereload** | Atualiza o navegador automaticamente quando há alterações no código. |
| **Desenvolvimento / Live Reload** | **connect-livereload** | Middleware que integra o *livereload* com o servidor Express. |


## 🔌 Funcionalidades Principais

* **Página de Apresentação:** Landing page de redirecionamento.
* **Catálogo de Produtos:** Listagem completa de todos os cafés disponíveis.
* **Páginas de Detalhes do Produto:** Informações, descrição e opções de compra para cada café.
* **Carrinho de Compras:** Funcionalidade para adicionar, remover e gerenciar itens.
* **Sistema de Autenticação/Autorização:** Cadastro e Login de usuários/administradores.
* **Checkout:** Processo simplificado de finalização de compra.
* **Painel Administrativo:** CRUD de produtos, gerenciamento de pedidos, etc. (Work in Progress)

## 🌐 Hospedagem e Serviços Utilizados

### 📍 Railway – Banco de Dados
A [**Railway**](https://railway.app/) é uma plataforma *cloud* que permite hospedar e gerenciar bancos de dados de forma simples e persistente.  
No projeto, ela é utilizada para manter o **banco de dados MySQL** acessível remotamente, garantindo **armazenamento seguro e contínuo** mesmo após reinicializações do servidor local.  

Além disso, o Railway facilita a conexão via variáveis de ambiente (`.env`), permitindo integração direta com o backend **Node.js**, simplificando o **desenvolvimento colaborativo** e o **deploy em produção**.

<img width="477" height="294" alt="image" src="https://github.com/user-attachments/assets/914e8bad-dc0a-435b-8394-f1deb1a2be3c" />

---

### 📍 Render – Servidor Node + Express
A [**Render**](https://render.com/) é uma plataforma de *deploy* que permite hospedar **aplicações web dinâmicas**, incluindo projetos com **Node.js e Express.js**.  
Ela oferece suporte à execução contínua de servidores, atualização automática a cada *push* no GitHub e gerenciamento simplificado de variáveis de ambiente.  

No projeto, o **Render** é utilizado para **publicar o servidor backend**, tornando as rotas e páginas acessíveis na web, conectadas diretamente ao banco hospedado na **Railway**.

<img width="445" height="160" alt="image" src="https://github.com/user-attachments/assets/0970e56f-ccb0-4f8a-82e5-b4271316e2b9" />


🧑‍💻 Autor

João Alberto Braun Urruzola

* [GitHub](https://github.com/joaourruzola)
* [Linkedin](https://www.linkedin.com/in/joao-urruzola/)
