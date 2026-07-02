# Billetera Pro - Cliente Frontend (React &amp; Vite)

Este es el cliente frontend de la aplicación Billetera Pro, desarrollado en React con Vite y estilizado utilizando Material-UI (MUI).

---

## 🛠️ Tecnologías y Características

- **Entorno de desarrollo**: Vite
- **Biblioteca**: React (Vite template)
- **UI &amp; Estilos**: Material-UI (MUI) con fuentes premium integradas.
- **Iconografía**: `@mui/icons-material` y favicon personalizado de moneda de oro (`coin.svg`).
- **Páginas**:
  - `Gastos`: Listado interactivo paginado de egresos monetarios.
  - `Usuarios`: Panel administrativo para registrar y editar perfiles (con protección de clave maestra).
  - `Auditoría`: Panel para revisar la bitácora de eliminaciones.
  - `Login`: Portal de acceso seguro para usuarios y administradores.

---

## ⚙️ Configuración del Cliente (`.env`)

Para apuntar el frontend a tu servidor backend (ya sea en local o producción), puedes crear un archivo `.env` en la raíz de esta carpeta a partir de `.env.example`:

```env
VITE_API_URL=http://localhost:5001/api
```

Si no se define esta variable, la aplicación por defecto intentará conectarse a `http://localhost:5001/api`.

---

## 🏃 Instalación y Ejecución Standalone

Si deseas iniciar el frontend de forma independiente:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación correrá en [http://localhost:5173](http://localhost:5173).

3. **Compilar para producción**:
   ```bash
   npm run build
   ```
   Los archivos compilados listos para producción se generarán en la carpeta `frontend/dist/`.
