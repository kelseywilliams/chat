FROM node:20-alpine 

WORKDIR /app

COPY frontend/package*.json ./frontend/

COPY backend/package*.json ./backend/

COPY package*.json ./

COPY frontend/ ./frontend/

COPY backend/ ./backend/

RUN npm run build

CMD ["npm", "run", "start"]