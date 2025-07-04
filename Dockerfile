FROM node:22.14.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=5173

EXPOSE 5173

CMD ["npm", "start"]