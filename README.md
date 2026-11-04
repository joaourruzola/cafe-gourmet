# ☕ Café Gourmet

An e-commerce site for selling specialty coffees, built with Node.js, Express and Handlebars, using MySQL as the database.

## Features

- **Landing page** with a hero carousel
- **Product catalog** with the full list of coffees
- **Product pages** with description and purchase options
- **Shopping cart** to add, remove and update items
- **Checkout** flow, with a QR code for payments
- **User accounts:** sign up and log in, with JWT-based authentication
- **Admin area** (work in progress): product management and orders

## Tech Stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Backend | Node.js, Express | Server, routing and middleware |
| Authentication | bcryptjs, jsonwebtoken, cookie-parser | Password hashing and JWT tokens |
| Views | Express-Handlebars | Server-side rendered pages |
| Styling | Bootstrap, Tailwind CSS | Responsive layout and styles |
| Database | MySQL2 | MySQL driver |
| Uploads | express-fileupload | Product image uploads |
| Utilities | dotenv, qrcode | Environment variables and QR codes |
| Development | nodemon, livereload, connect-livereload | Auto-restart and browser reload |

## Getting Started

### Prerequisites

- Node.js
- A MySQL database

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=cafe_gourmet
JWT_SECRET=a_long_random_string
```

The repository does not include a database schema. Create the tables used by the models in `models/` before starting the app.

### Running

```bash
npm start   # production-style start
npm run dev # development mode with auto-restart and live reload
```

## Deployment

- **Database:** [Railway](https://railway.app/) hosts the MySQL database, so it stays available across restarts. The connection is configured with the `DB_*` environment variables.
- **Server:** [Render](https://render.com/) runs the Node.js and Express backend. It redeploys on each push to GitHub and connects to the Railway database.

## Project Structure

```
├── app.mjs              # Application entry point
├── models/db.js         # MySQL connection
├── routes/              # Routes: index, auth, cart, admin
├── middlewares/         # Authentication and admin checks
├── views/               # Handlebars templates and layouts
└── public/              # Static files (CSS, JavaScript, images)
```

## Author

**João Alberto Braun Urruzola**

- [GitHub](https://github.com/joaourruzola)
- [LinkedIn](https://www.linkedin.com/in/joao-urruzola/)
