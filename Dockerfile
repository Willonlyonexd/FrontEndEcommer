FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

# ✅ CAMBIO: Instalar TODAS las dependencias
RUN npm ci && npm cache clean --force

COPY . .

# ✅ CAMBIO: Comando más simple
RUN npm run build

FROM nginx:alpine

# ✅ CAMBIO: Usar el nombre correcto del proyecto (verifica con ls dist/)
COPY --from=build /app/dist/panel /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
