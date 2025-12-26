# Usamos la imagen oficial de Nginx basada en Alpine (muy ligera)
FROM nginx:alpine

# Copiamos el contenido de src al directorio que Nginx sirve por defecto
COPY src/ /usr/share/nginx/html/

# Copiamos nuestra configuración personalizada
COPY config/default.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]