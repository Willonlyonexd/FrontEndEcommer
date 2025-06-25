# Etapa 1: Build de la aplicación
FROM node:18-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servidor de producción
FROM nginx:alpine AS production

# Copiar la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos desde la etapa de build
COPY --from=build /app/dist/panel/browser /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
