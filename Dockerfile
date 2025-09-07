FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production
RUN npm install -g @nestjs/cli   # <---- AJOUT


COPY . .

EXPOSE 3000
CMD ["npm", "start"]
