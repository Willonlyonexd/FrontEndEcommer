# Etapa 1: Construcción (Build stage)
FROM node:18-alpine AS build

# ¿Por qué Alpine? Es más liviana (5MB vs 900MB de Ubuntu)
WORKDIR /app

# Copiar solo package.json primero
# ¿Por qué? Para aprovechar el cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Ahora copiar todo el código
COPY . .

# Construir la aplicación para producción
# ¿Por qué --configuration=production? Optimiza el código (minifica, tree-shaking)
RUN npm run build --configuration=production

# Etapa 2: Producción (Runtime stage)
FROM nginx:alpine

# ¿Por qué nginx? Es perfecto para servir archivos estáticos
# Copiar archivos construidos desde la etapa anterior
COPY --from=build /app/dist/tu-proyecto-name /usr/share/nginx/html

# Configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
