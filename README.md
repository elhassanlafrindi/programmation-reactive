# Reactive Programming with Server-Sent Events (SSE)

This project demonstrates reactive programming with Spring WebFlux and Server-Sent Events for real-time updates.

## Project Structure

- **reactiveApp**: Spring Boot backend with reactive programming and SSE
- **demo-reactive-app**: React frontend with real-time updates via SSE

## Backend Setup (reactiveApp)

### Prerequisites

- Java 21
- Maven
- Elasticsearch running on `http://localhost:9200`

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd reactiveApp
   ```

2. Compile the project:
   ```bash
   mvn clean compile
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`

### API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Create a product
- `GET /api/products/{id}` - Get a product by ID
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product
- `GET /api/products/live` - SSE stream for real-time updates

## Frontend Setup (demo-reactive-app)

### Prerequisites

- Node.js
- npm

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd demo-reactive-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

## Features

- Real-time product updates using Server-Sent Events
- Full CRUD operations for products
- Reactive programming with Spring WebFlux
- Modern React with hooks and Material UI

## Troubleshooting

- Make sure Elasticsearch is running on `http://localhost:9200`
- Ensure the backend is running on `http://localhost:8080` before starting the frontend