FROM node:12-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN npm i -g nodemon
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]