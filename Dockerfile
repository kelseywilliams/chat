FROM node:20-alpine 

WORKDIR /app

ARG NODE_ENV="development"

COPY frontend/package*.json ./frontend/

COPY backend/package*.json ./backend/

COPY package*.json ./

RUN npm ci

COPY frontend/ ./frontend/

COPY backend/ ./backend/

RUN npm run build

CMD ["npm", "run", "start"]