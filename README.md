# YouTube Downloader

Aplicación web para descargar videos de YouTube en diferentes resoluciones. Desarrollada con FastAPI (Backend) y React + Vite (Frontend).

## 🛠Tecnologías

### Backend
- Python 3.8+
- FastAPI
- SQLModel (ORM)
- PyTubeFix (descarga de YouTube)
- FFmpeg (procesamiento de video)

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios
- Lucide React (iconos)

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Python**: 3.8 o superior
- **pip**: 20.0 o superior (incluido con Python)
- **Node.js**: 18.0 o superior
- **npm**: 9.0 o superior (incluido con Node.js)

### Verificar versiones instaladas

```bash
# Verificar Python
python --version  # o python3 --version

# Verificar pip
pip --version  # o pip3 --version

# Verificar Node.js
node --version

# Verificar npm
npm --version
```

## 🚀 Instalación y Configuración

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/SlenderDigital/FreeYoutubeWEB
cd FreeYoutubeWEB
```

### 2️⃣ Configurar el Backend

#### Crear entorno virtual (recomendado)

```bash
# En la raíz del proyecto
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate

# En macOS/Linux:
source venv/bin/activate
```

#### Instalar dependencias

```bash
pip install -r backend/requirements.txt
```

**Nota sobre FFmpeg**: La biblioteca `imageio-ffmpeg` instalará automáticamente FFmpeg. Si encuentras problemas, puedes instalarlo manualmente:

- **Windows**: Descargar desde [ffmpeg.org](https://ffmpeg.org/download.html)
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

#### Crear carpeta de almacenamiento

```bash
# En la raíz del proyecto
mkdir storage
```

### 3️⃣ Configurar el Frontend

#### Navegar a la carpeta frontend

```bash
cd frontend
```

#### Instalar dependencias

```bash
npm install
```

#### Configurar variables de entorno

El archivo `.env` ya existe en `frontend/src/.env` con la configuración:

```env
VITE_API_URL=http://127.0.0.1:8001/api
```


## ▶ Ejecutar la Aplicación

###  Iniciar el Backend

Desde la raíz del proyecto (con el entorno virtual activado):

```bash
python backend/server.py
```

O usando uvicorn directamente:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
```

El backend estará disponible en: `http://localhost:8001`

**API Docs**: `http://localhost:8001/docs`

###  Iniciar el Frontend

En otra terminal, navega a la carpeta frontend:

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

##  Estructura del Proyecto

```
.
├── backend/
│   ├── database/
│   │   ├── models.py          # Modelos de base de datos
│   │   └── database.py        # Configuración de DB
│   ├── routers/
│   │   └── history.py         # Endpoints de historial
│   ├── youtube/
│   │   └── yt_logic.py        # Lógica de descarga
│   ├── config.py              # Configuración
│   ├── main.py                # Aplicación FastAPI
│   ├── server.py              # Punto de entrada
│   ├── utils.py               # Utilidades
│   └── requirements.txt       # Dependencias Python
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── Header.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── VideoCard.jsx
│   │   │   └── History.jsx
│   │   ├── App.jsx            # Componente principal
│   │   ├── main.jsx           # Punto de entrada
│   │   └── index.css          # Estilos globales
│   ├── package.json           # Dependencias Node
│   └── vite.config.js         # Configuración Vite
└── storage/                   # Videos descargados
```

##  Endpoints Principales

### Backend API

- `GET /api/yt/video-info` - Obtener información del video
- `GET /api/yt/download_video` - Descargar video
- `GET /api/history/videos` - Obtener historial
- `DELETE /api/history/clear` - Limpiar historial
- `DELETE /api/history/video/{id}` - Eliminar video específico

## 🎯 Uso de la Aplicación

1. **Buscar video**: Pega la URL de YouTube en la barra de búsqueda
2. **Seleccionar resolución**: Elige la calidad de descarga deseada
3. **Descargar**: Haz clic en "Descargar Video"
4. **Ver historial**: Accede a tus búsquedas anteriores desde el botón "Historial"

## 🐛 Solución de Problemas

### El backend no inicia

- Verifica que el entorno virtual esté activado
- Asegúrate de que el puerto 8001 no esté en uso
- Revisa que todas las dependencias estén instaladas: `pip list`

### El frontend no se conecta al backend

- Verifica que el backend esté corriendo
- Confirma que la URL en `frontend/src/.env` sea correcta
- Revisa la consola del navegador para errores CORS

### Error al descargar videos

- Verifica tu conexión a internet
- Asegúrate de que la URL de YouTube sea válida
- Confirma que FFmpeg esté instalado correctamente

### Error "Module not found"

**Backend**:
```bash
pip install -r backend/requirements.txt --upgrade
```

**Frontend**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Notas Importantes

- Los videos se guardan en la carpeta `storage/` en la raíz del proyecto
- La base de datos SQLite se crea automáticamente en `backend/database/sqlite/`
- El historial persiste entre sesiones
- Asegúrate de tener suficiente espacio en disco para las descargas