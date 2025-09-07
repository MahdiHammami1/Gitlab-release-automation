FROM node:20

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier uniquement les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (prod + dev pour compiler NestJS + Prisma)
RUN npm install

# Installer le CLI NestJS globalement
RUN npm install -g @nestjs/cli

# Installer Prisma globalement (utile pour generate)
RUN npm install -g prisma

# Copier le reste du code source
COPY . .

# Générer les types Prisma (après avoir copié le schema.prisma)
RUN npx prisma generate

# Exposer le port du backend
EXPOSE 3000

# Lancer l'application
CMD ["npm", "run", "start:dev"]
