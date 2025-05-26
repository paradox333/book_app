# 📚 Sistema de Gestión de Libros (Backend con NestJS, Frontend con React + Vite)

Este repositorio contiene un sistema completo para la gestión de libros, incluyendo un backend robusto construido con **NestJS** y **Sequelize-TypeScript**, y un frontend dinámico desarrollado con **React** y **Vite**.

---

## 🚀 Inicio Rápido

Para levantar el proyecto y empezar a trabajar, sigue estos pasos:

### 1. Requisitos Previos

Asegúrate de tener instalado lo siguiente:

* **Node.js**: Versión 18 o superior.
* **Yarn**: Un gestor de paquetes de Node.js. Si no lo tienes, instálalo globalmente:
    ```bash
    npm install -g yarn
    ```
* **Base de Datos PostgreSQL**: Este proyecto está configurado para usar PostgreSQL. Asegúrate de tener una instancia corriendo y accesible.

### 2. Configuración del Backend

1.  **Navega al directorio del backend**:
    ```bash
    cd backend/ # Asumiendo que 'backend' es el nombre de tu carpeta de backend
    ```
2.  **Instala las dependencias**:
    ```bash
    yarn install
    ```
3.  **Configura las variables de entorno**:
    Crea un archivo `.env` en la raíz del directorio `backend_cmpc` con la configuración de tu base de datos y JWT. Ejemplo:
    ```env
    # Database ejemplo de definicion
    DB_NAME=postgres
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=admin
    DB_PASSWORD=admin
    DB_SCHEMA=cmpc

    # JWT
    JWT_SECRET=superSecretKeyDeNestJS
    JWT_EXPIRES_IN=1h

    # Config
    APP_PORT=3000
    FRONT_CORS_PORT=3003
    ```
    Asegúrate de que `DB_DATABASE` exista en tu instancia de PostgreSQL o crea una nueva.

    Es importante que los valores definidos en las variables de base de datos sean las mismas definidas en el docker-compose
    ```yml
    backend_cmpc:
    build: ./backend_cmpc
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: admin
      DB_PASS: admin
      DB_NAME: postgres
      DB_SCHEMA: cmpc
    db:
    image: postgres:15
    restart: always
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: postgres
    ```

    Crea un archivo `.env` en la raíz del directorio `frontend-cmpc` con el host del backend, el puerto del frontend y la url de la imagen por defecto. Ejemplo:
    ```env
    VITE_API_BASE_URL=http://localhost:3000
    VITE_PORT=3003
    VITE_DEFAULT_BOOK_IMAGE=/public/vite.svg
    ```
    Se recomienda utilizar los mismo valores proporcionados

5.  **Ejecuta las migraciones (y seeders, si tienes)**:
    Si tu proyecto usa migraciones de Sequelize para configurar la base de datos, ejecútalas. Por ejemplo:
    ```bash
    # Si usas sequelize-cli o comandos similares para migraciones
    yarn db:migrate
    # Si tienes seeders para poblar datos iniciales
    yarn db:seed:all
    ```
    *(**Nota**: Los comandos exactos de migración y seeder pueden variar según cómo los hayas configurado en tu proyecto NestJS/Sequelize.)*

6.  **Levanta el servidor backend**:
    ```bash
    yarn start:dev
    ```
    El backend debería iniciarse en `http://localhost:3000` (o el puerto configurado en NestJS).

### 3. Configuración del Frontend

1.  **Navega al directorio del frontend**:
    ```bash
    cd frontend/ # O el nombre de tu carpeta de frontend, ej. 'client', 'app'
    ```
2.  **Instala las dependencias**:
    ```bash
    yarn install
    ```
3.  **Configura las variables de entorno**:
    Crea un archivo `.env` (o `.env.local` para Vite) en la raíz del directorio `frontend` para especificar la URL base de tu API.
    ```env
    VITE_API_BASE_URL=http://localhost:3000 # Ajusta si tu backend usa un path base diferente, ej. http://localhost:3000/api
    ```
    *(**Importante**: Para que Vite exponga la variable al navegador, debe comenzar con `VITE_`.)*

4.  **Levanta el servidor de desarrollo del frontend**:
    ```bash
    yarn dev
    ```
    El frontend debería abrirse automáticamente en tu navegador, generalmente en `http://localhost:5173` (o el puerto que Vite asigne).

---

## 💻 Módulos Principales y Funcionalidad

### 1. Backend (NestJS, Sequelize-TypeScript)

El backend es una API RESTful robusta y modular, construida con **NestJS** y utilizando **Sequelize-TypeScript** como ORM para la interacción con **PostgreSQL**.

* **Autenticación y Autorización**: Implementa la seguridad de las rutas a través de **JWT (JSON Web Tokens)**, controlando el acceso a funcionalidades protegidas.
* **Módulo `Libros`**:
    * **Gestión CRUD completa**: Permite la creación, lectura (listados paginados y por ID), actualización y eliminación de registros de libros.
    * **Paginación y Filtrado**: Ofrece funcionalidades de paginación eficientes y capacidad de filtrar listados por diversos criterios.
    * **Relaciones con Entidades**: Los libros tienen relaciones definidas con `Autores`, `Editoriales` y `Géneros`. Al consultar libros, el backend está configurado para incluir los datos de estas entidades relacionadas.
    * **Subida de Imágenes**: Gestiona la recepción de archivos de imagen para las portadas de los libros.
* **Módulos `Autores`, `Editoriales`, `Géneros`**:
    * Cada uno de estos módulos expone endpoints para la gestión de sus respectivas entidades.
    * **Crucial para el Flujo del Frontend**: Estos endpoints son utilizados por el frontend para crear nuevas instancias de autor/género/editorial *antes* de asociarlas a un libro, o para obtener sus IDs si ya existen.
* **Logging**: Incorpora un sistema de logs para rastrear operaciones y eventos importantes del servidor.

### 2. Frontend (React, Vite)

El frontend es una aplicación web dinámica que interactúa con el backend a través de solicitudes HTTP. Utiliza **React** para la interfaz de usuario y **Vite** para un desarrollo rápido.

* **Autenticación**: Provee una interfaz para el inicio de sesión y gestiona el estado de autenticación (el `token` JWT) mediante un `AuthContext` global.
* **Gestión de Libros (`BookList` / `LibroList`)**:
    * Presenta un listado de libros con funcionalidades de paginación y filtrado.
    * Permite a los usuarios visualizar los detalles de cada libro, así como acceder a las opciones de edición y eliminación.
* **Formulario de Libro (`BookForm` / `LibroForm`)**:
    * Interfaz unificada para la creación y edición de libros.
    * **Lógica de Creación/Consulta de Entidades en Frontend**: Implementa la lógica para gestionar autores, géneros y editoriales directamente desde el formulario del libro:
        1.  El usuario ingresa el *nombre* del autor, género o editorial.
        2.  El frontend consulta si existe una entidad con ese nombre en las listas ya cargadas.
        3.  Si no existe, el frontend realiza una solicitud `POST` al endpoint correspondiente del backend (`/autores`, `/generos`, `/editoriales`) para crear la nueva entidad.
        4.  Una vez obtenido el `ID` de la entidad (ya sea existente o recién creada), este `ID` es el que se envía al backend en la solicitud de creación o actualización del libro.
    * **Componente de Carga de Imágenes (`ImageUpload`)**: Facilita la selección y previsualización de imágenes de portada antes de la subida.
* **Enrutamiento**: Utiliza `react-router-dom` para una navegación fluida entre las diferentes secciones de la aplicación.

---

## 📊 Coverage del Backend

El backend está configurado con pruebas unitarias y de integración para garantizar su robustez y calidad. Puedes generar un reporte detallado de la cobertura de código para ver qué partes del código están siendo probadas.

Para ejecutar las pruebas y generar el reporte de cobertura:

1.  **Navega al directorio del backend**:
    ```bash
    cd backend/
    ```
2.  **Ejecuta las pruebas con cobertura**:
    ```bash
    yarn test --coverage
    ```
    Esto ejecutará todas las pruebas y generará un reporte de cobertura en el directorio `coverage/` dentro de tu backend. Para ver un análisis visual, abre el archivo `lcov-report/index.html` en tu navegador.
