# 🎬 Flux - Plataforma de Streaming & Gestión de Contenidos

Flux es una aplicación web moderna diseñada para la exploración de películas y series, integrando una experiencia de usuario fluida con una arquitectura robusta desplegada en la nube. El proyecto combina el uso de APIs públicas (TMDB) con una persistencia de datos propia para la gestión de usuarios y carritos de compra.

## 🚀 Enlaces del Proyecto

Puedes acceder a la versión en producción y a su documentación técnica a través de los siguientes enlaces:

- **🌐 Aplicación en Vivo:** [https://flux.tkdsierranevada.com/](https://flux.tkdsierranevada.com/)
- **📚 Documentación Técnica (JSDoc):** [https://flux.tkdsierranevada.com/docs](https://flux.tkdsierranevada.com/docs)

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend Fake/Persistence:** `json-server` para la gestión de usuarios y estados del carrito.
- **API Externa:** The Movie Database (TMDB) para el catálogo de contenido.
- **Notificaciones:** EmailJS para la confirmación de pedidos por correo electrónico.
- **Infraestructura:** \* **AWS (EC2):** Instancia de Amazon Linux para el hosting.
- **Docker & Docker Compose:** Containerización de la web, la API y Nginx.
- **Nginx:** Servidor web y Proxy Inverso con soporte SSL (Let's Encrypt).
- **CI/CD:** GitHub Actions para el despliegue automatizado.

---

## 🏗️ Arquitectura de Despliegue

La aplicación se ejecuta en un entorno de contenedores orquestados para garantizar la seguridad y la disponibilidad:

1. **Nginx (Puerto 443/SSL):** Actúa como puerta de enlace, gestionando los certificados SSL y redirigiendo el tráfico:

- Tráfico web → Servido desde el contenedor de la aplicación.
- Tráfico `/api/` → Proxy inverso hacia el contenedor `json-server`.
- Tráfico `/docs/` → Servido desde la carpeta de documentación generada.

2. **JSON-Server (Puerto 3000):** Gestiona la base de datos `db.json` de forma aislada.

---

## 📦 Características Principales

- **Autenticación de Usuarios:** Sistema de login y registro validado contra base de datos propia.
- **Catálogo Dinámico:** Filtrado por géneros, búsqueda por texto y ordenación en tiempo real.
- **Carrito de Compra:** Gestión persistente de artículos (añadir, eliminar, modificar cantidades).
- **Checkout & Email:** Finalización de compra con envío automático de resumen del pedido mediante EmailJS.
- **Diseño Responsive:** Interfaz adaptada a dispositivos móviles y escritorio.

---

## 🔧 Instalación Local

Si deseas ejecutar este proyecto en tu entorno local:

1. **Clona el repositorio:**

```bash
git clone https://github.com/Diana27106/ProyectoNavidad2025-26.git

```

2. **Instala las dependencias:**

```bash
npm install

```

3. **Lanza el servidor de desarrollo (Docker):**

```bash
docker-compose up -d

```

4. **Accede a la app:** `http://localhost:80`

---

## 📝 Notas de Desarrollo

- La documentación se genera automáticamente mediante **JSDoc**. Puedes consultar la lógica de las clases principales como `Carrito` y las funciones de filtrado en el enlace de documentación arriba indicado.
- El despliegue en AWS cuenta con renovación automática de certificados mediante `certbot`.

---

**Desarrollado por Diana Radu** - 2025/2026
