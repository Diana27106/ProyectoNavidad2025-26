FROM nginx:alpine

# 1. Copiamos el contenido de la web a la raíz
COPY src/ /usr/share/nginx/html/

# 2. Copiamos la documentación generada a la subcarpeta /docs
# GitHub Actions pone la carpeta 'docs' en el mismo nivel que el Dockerfile
COPY docs/ /usr/share/nginx/html/docs/

# 3. Tu configuración de Nginx
COPY config/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]