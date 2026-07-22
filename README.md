# Instalación y ejecución del sistema

## Requisitos previos

Antes de ejecutar el proyecto, asegúrese de tener instalado:

* PHP 8.3 o superior
* Composer
* Node.js y npm
* MySQL
* Git

## Clonar el repositorio

```bash
git clone https://github.com/jcontrerasa9/gestion-torneos-unal.git
cd gestion-torneos-unal
```

## Instalar dependencias

### Backend

```bash
cd backend
composer install
```

### Frontend

```bash
cd ../frontend
npm install
```

### Dependencias de la raíz

```bash
cd ..
npm install
```

## Configurar el entorno

Copiar el archivo de configuración del backend y generar la clave de Laravel:

```bash
cd backend
cp .env.example .env
php artisan key:generate
```

Editar el archivo `.env` y configurar las credenciales de la base de datos:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_torneos
DB_USERNAME=root
DB_PASSWORD=
```

## Ejecutar migraciones y seeders

```bash
php artisan migrate:fresh --seed
```

## Ejecutar el sistema

Volver a la carpeta raíz del proyecto y ejecutar:

```bash
cd ..
npm run dev
```

Este comando inicia simultáneamente:

* El servidor backend de Laravel en `http://127.0.0.1:8000`
* El frontend de React en `http://localhost:5173`
* El servicio de cola de Laravel

## Acceso al sistema

Una vez ejecutado el comando anterior, el sistema estará disponible en:

* Frontend: `http://localhost:5173`
* Backend API: `http://127.0.0.1:8000`
