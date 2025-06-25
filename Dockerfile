# Etapa 1: Build de Angular SPA
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build --prod

# Etapa 2: Servir con Nginx
FROM nginx:1.23.3-alpine

COPY nginx.conf /etc/nginx/nginx.conf

# CAMBIO: Copia todo el contenido de panel
COPY --from=build /app/dist/panel/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
