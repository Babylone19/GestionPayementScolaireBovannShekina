# Image de base
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY public ./public
COPY src ./src

# Exposer le port 3009
EXPOSE 3009

# Démarrer le serveur React en mode production
CMD ["npm", "start"]