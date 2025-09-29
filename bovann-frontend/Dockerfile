# Étape de build
FROM node:18-alpine as build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY public ./public
COPY src ./src

# Build l'application
RUN npm run build

# Étape de production
FROM nginx:alpine

# Copier les fichiers buildés depuis l'étape de build
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration nginx personnalisée (optionnel)
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]