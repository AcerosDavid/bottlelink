# BottleLink

![BottleLink Logo](logobottlelink.png)

BottleLink es una plataforma de monitorización, análisis e historial de enlaces y archivos alojados en diferentes servicios de almacenamiento en la nube. **La interfaz está completamente en español.**

## 🎯 Características

- **Monitorización de enlaces**: Comprobación periódica de enlaces de múltiples proveedores
- **Detección de cambios**: Identificación de cambios en archivos y metadatos
- **Historial completo**: Registro de todos los cambios y estados de los enlaces
- **Análisis multimedia**: Extracción de metadatos de archivos de video/audio con FFmpeg
- **Dashboard interactivo**: Interfaz web en español para visualizar estadísticas y estado de enlaces
- **Arquitectura modular**: Sistema extensible para añadir nuevos proveedores fácilmente
- **Tema oscuro moderno**: Diseño actualizado con modo oscuro y gradientes

## 🚀 Tecnologías

### Backend
- **Node.js** + **Express** + **TypeScript**
- **SQLite** para persistencia de datos
- **node-cron** para tareas programadas (sin Redis/Docker)
- **FFmpeg** para análisis de archivos multimedia

### Frontend
- **React** + **TypeScript**
- **TailwindCSS v4** para estilos
- **Recharts** para gráficos y visualizaciones
- **Vite** como bundler

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- FFmpeg (instalado y disponible en el PATH)

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd bottlelink
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar FFmpeg**
Asegúrate de que FFmpeg esté instalado en tu sistema:
- **Windows**: Descarga desde [ffmpeg.org](https://ffmpeg.org/download.html) y agrega al PATH
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg` o `sudo yum install ffmpeg`

## 🎮 Uso

### Iniciar el servidor backend
```bash
npm run dev:server
```
El servidor API estará disponible en `http://localhost:3001/api`

### Iniciar el frontend
```bash
npm run dev
```
La aplicación web estará disponible en `http://localhost:5173`

### Comandos disponibles
```bash
npm run dev:server    # Inicia el servidor backend en modo desarrollo
npm run dev          # Inicia el frontend en modo desarrollo
npm run build        # Compila el frontend para producción
npm run preview      # Previsualiza el build de producción
npm run lint         # Ejecuta el linter
```

## 🌐 Proveedores Soportados

- **MEGA** - Servicio de almacenamiento en la nube
- **MediaFire** - Plataforma de compartir archivos
- **Google Drive** - Servicio de Google
- **Dropbox** - Almacenamiento en la nube
- **OneDrive** - Servicio de Microsoft
- **Pixeldrain** - Servicio de compartir archivos
- **HTTP/HTTPS** - Enlaces web genéricos

## 📊 Arquitectura

### Estructura del proyecto
```
bottlelink/
├── src/
│   ├── server/              # Backend
│   │   ├── controllers/     # Controladores API
│   │   ├── models/          # Modelos de base de datos
│   │   ├── providers/       # Implementaciones de proveedores
│   │   ├── services/        # Lógica de negocio
│   │   ├── jobs/            # Tareas programadas
│   │   └── routes/          # Rutas API
│   ├── components/          # Componentes React
│   │   ├── Dashboard.tsx
│   │   ├── LinkDetails.tsx
│   │   ├── AddLinkModal.tsx
│   │   └── StatisticsCharts.tsx
│   ├── utils/              # Utilidades
│   └── App.tsx             # Componente principal
├── public/                 # Archivos estáticos
│   └── logobottlelink.png  # Logo de la aplicación
└── database/               # Base de datos SQLite
```

### API Endpoints

#### Enlaces
- `GET /api/links` - Obtener todos los enlaces
- `POST /api/links` - Crear nuevo enlace
- `GET /api/links/:id` - Obtener detalles de un enlace
- `DELETE /api/links/:id` - Eliminar enlace
- `POST /api/links/:id/check` - Verificar enlace manualmente

#### Estadísticas
- `GET /api/statistics/overall` - Estadísticas generales
- `GET /api/statistics/status-distribution` - Distribución de estados
- `GET /api/statistics/provider` - Estadísticas por proveedor

#### Proveedores
- `GET /api/providers` - Obtener proveedores disponibles

## 🔧 Configuración

### Variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# API Configuration
VITE_API_BASE=/api
PORT=3001

# Database (opcional, por defecto usa SQLite)
DATABASE_PATH=./database/bottlelink.db
```

## 📈 Estados de Enlaces

- **ACTIVE** - El enlace está funcionando correctamente
- **DEAD** - El enlace no está disponible
- **CHANGED** - El contenido del archivo ha cambiado
- **RESTRICTED** - El enlace tiene restricciones de acceso
- **ERROR** - Error al verificar el enlace
- **UNKNOWN** - Estado desconocido

## 🎨 Personalización

### Colores del tema
El tema usa colores personalizados definidos en `src/index.css`:
- Brand: Gradiente púrpura (#7c3aed → #a78bfa)
- Background: #0f0f14 (modo oscuro)
- Cards: #16161f con bordes #2a2a3a

### Añadir nuevos proveedores
1. Crea un nuevo archivo en `src/server/providers/`
2. Implementa la interfaz `Provider`
3. Regístralo en `ProviderFactory`

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**BottleLink** - Plataforma de monitorización de enlaces

## 🙏 Agradecimientos

- TailwindCSS por el framework de CSS
- Recharts por las librerías de gráficos
- FFmpeg por las herramientas de análisis multimedia
- La comunidad de código abierto

---

**Desarrollado con ❤️ usando TypeScript y React**


## Proveedores Soportados

- MEGA
- MediaFire
- Google Drive
- Dropbox
- OneDrive
- Pixeldrain
- HTTP/HTTPS (genérico)

## Stack Tecnológico

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TailwindCSS + Alpine.js
- **Base de datos**: SQLite
- **Cola de trabajos**: BullMQ con Redis
- **Análisis multimedia**: FFmpeg

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar Redis (necesario para la cola de trabajos):
   ```bash
   # Usar Docker
   docker run -d -p 6379:6379 redis
   ```

4. Configurar variables de entorno (opcional):
   ```bash
   # .env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   VITE_API_BASE=http://localhost:3001/api
   ```

## Uso

### Iniciar el servidor backend:

```bash
npm run dev:server
```

El servidor API estará disponible en `http://localhost:3001`

### Iniciar el frontend:

```bash
npm run dev
```

La aplicación web estará disponible en `http://localhost:5173`

### Iniciar ambos simultáneamente:

En una terminal:
```bash
npm run dev:server
```

En otra terminal:
```bash
npm run dev
```

## API Endpoints

### Links
- `GET /api/links` - Obtener todos los enlaces
- `POST /api/links` - Crear nuevo enlace
- `GET /api/links/:id` - Obtener detalles de un enlace
- `PUT /api/links/:id` - Actualizar enlace
- `DELETE /api/links/:id` - Eliminar enlace
- `POST /api/links/:id/check` - Comprobar enlace inmediatamente
- `GET /api/links/:id/history` - Obtener historial de comprobaciones
- `GET /api/links/:id/events` - Obtener eventos del enlace

### Providers
- `GET /api/providers` - Obtener todos los proveedores
- `GET /api/providers/:id` - Obtener detalles de un proveedor
- `POST /api/providers` - Crear nuevo proveedor
- `PUT /api/providers/:id` - Actualizar proveedor
- `DELETE /api/providers/:id` - Eliminar proveedor

### Statistics
- `GET /api/statistics/overall` - Estadísticas generales
- `GET /api/statistics/providers` - Estadísticas por proveedor
- `GET /api/statistics/links/:id` - Estadísticas de un enlace
- `GET /api/statistics/activity` - Actividad reciente
- `GET /api/statistics/distribution/status` - Distribución por estado
- `GET /api/statistics/timebased` - Estadísticas temporales

## Estructura del Proyecto

```
bottlelink/
├── src/
│   ├── server/              # Backend
│   │   ├── controllers/     # Controladores API
│   │   ├── models/          # Modelos de base de datos
│   │   ├── providers/       # Adaptadores de proveedores
│   │   ├── services/        # Lógica de negocio
│   │   ├── jobs/            # Colas de trabajos
│   │   ├── routes/          # Rutas API
│   │   ├── middleware/      # Middleware Express
│   │   └── index.ts         # Punto de entrada servidor
│   ├── components/          # Componentes React
│   ├── utils/              # Utilidades (API client)
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Punto de entrada React
├── data/                   # Base de datos SQLite
└── package.json
```

## Estados de Enlace

- `ACTIVE`: El enlace está funcionando correctamente
- `DEAD`: El enlace no está disponible
- `CHANGED`: El archivo asociado ha cambiado
- `REDIRECTED`: El enlace redirige a otra URL
- `RESTRICTED`: El enlace requiere autenticación o tiene restricciones
- `ERROR`: Error al comprobar el enlace
- `UNKNOWN`: Estado desconocido

## Desarrollo

### Agregar un nuevo proveedor

1. Crear una clase que extienda `BaseProvider` en `src/server/providers/`
2. Implementar los métodos `validateUrl` y `checkLink`
3. Registrar el proveedor en `ProviderFactory`
4. Agregar el proveedor a la base de datos inicial si es necesario

### Extender el análisis multimedia

El servicio `MediaAnalysisService` usa FFmpeg para analizar archivos. Puedes extenderlo para:

- Soportar más formatos de archivo
- Extraer metadatos adicionales
- Implementar análisis personalizado

## Licencia

MIT
