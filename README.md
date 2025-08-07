# 🚀 Terra Discover API

A robust and scalable API built with **Hono**, **Zod-OpenAPI**, and **Prisma**, designed to manage information about various spaces, their features, and user interactions. This API serves as the backbone for a platform focused on discovering and exploring places.

## ✨ Key Features

- **RESTful API Endpoints**: Comprehensive routes for managing users, authentication, and various "spaces" (e.g., parks, historical sites, attractions).
- **Built-in OpenAPI Documentation**: Self-generating API documentation using Zod-OpenAPI and Scalar, providing interactive exploration of all endpoints, schemas, and examples.
- **Database Management**: Utilizes the Prisma ORM for efficient and type-safe database interactions.
- **Secure Authentication**: Robust user authentication and authorization workflows.
- **JSON Schema Validation**: Strong input validation using Zod schemas to ensure data integrity.
- **Fast Development Environment**: Powered by **Bun** for quick installations and rapid iteration.

## 🛠️ Technologies Used

- **Framework**: [Hono](https://hono.dev/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Schema Validation**: [Zod](https://zod.dev/)
- **API Documentation**:
  - [`@hono/zod-openapi`](https://github.com/honojs/hono-zod-openapi)
  - [`@scalar/hono-api-reference`](https://github.com/scalar/scalar/tree/main/packages/hono-api-reference)
- **Runtime/Package Manager**: [Bun](https://bun.sh/)
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 🚀 Getting Started

Follow these steps to get the Terra Discover API running locally on your machine.

### Prerequisites

Ensure you have the following installed before you begin:

- **Bun**: [Installation Guide](https://bun.sh/docs/installation)
- **Docker & Docker Compose**: [Installation Guide](https://docs.docker.com/get-docker/)

### Installation

1.  **Clone the Repository:**

    ```bash
    git clone [https://github.com/obbylee/terra-discover-api.git](https://github.com/obbylee/terra-discover-api.git)
    cd terra-discover-api
    ```

2.  **Install Dependencies:**
    ```bash
    bun install
    ```

### Environment Variables

The project uses environment variables for configuration (e.g., database connection).

1.  **Create your local `.env` file:**
    Copy the example environment file and rename it.
    ```bash
    cp .env.example .env
    ```
2.  **Configure `.env`:**
    Open the `.env` file and fill in the necessary values. Refer to `.env.example` for a complete list.

    ```env
    # Database Configuration
    DATABASE_URL="postgresql://user:password@localhost:5432/yourdb_name?schema=public" # Adjust user, password, port, db_name
    # ... other environment variables (e.g., JWT_SECRET, API_BASE_URL)
    ```

### Database Setup

This project uses Docker Compose to run a local PostgreSQL database.

1.  **Start the Database Container:**
    Navigate to the project root and run Docker Compose in detached mode.

    ```bash
    docker-compose up -d database
    ```

2.  **Run Prisma Migrations:**
    Once the database container is running, apply the Prisma migrations to set up your database schema.

    ```bash
    bun run db:migrate
    ```

3.  **Generate Prisma Client:**
    After migrations, generate the Prisma client code. This step creates the necessary files for your application to interact with the database in a type-safe manner.
    ```bash
    bun run db:generate # or 'bun prisma generate'
    ```
    Populate your database with initial records:
    ```bash
    bun run db:seed
    ```

### Running the Application

1.  **Start the Development Server:**
    ```bash
    bun dev
    ```
    The API will start running locally, typically on `http://localhost:3000`.

### Accessing API Documentation

Once the API is running, you can access the interactive OpenAPI documentation:

- **Swagger UI (Scalar):** Visit `http://localhost:3000/api/docs` in your browser.
- **OpenAPI JSON:** Access the raw OpenAPI JSON specification at `http://localhost:3000/api/openapi.json`.

## 📚 API Endpoints

The API provides various endpoints categorized by functionality:

- `/api/users` - User management
- `/api/auth` - Authentication routes
- `/api/spaces` - Management of space records (create, read, update, delete)
- `/api/features` - Management of space features
- `/api/categories` - Management of space categories
- `/api/types` - Management of space types

Refer to the interactive API documentation at `/api/docs` for a comprehensive list of all available endpoints, request/response schemas, and example payloads.
