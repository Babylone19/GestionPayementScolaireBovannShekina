FROM node:18-alpine

WORKDIR /app

# 1. Copier package.json
COPY package*.json ./

# 2. Copier le dossier prisma AVANT npm ci
COPY prisma ./prisma

# 3. Installer les dépendances (déclenche postinstall → prisma generate)
RUN npm ci

# 4. Copier le reste du code
COPY src ./src
COPY tsconfig.json ./

# 5. Compiler
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]