FROM node:18-alpine

WORKDIR /app

# Frontend build
COPY admin/package*.json ./admin/
WORKDIR /app/admin
RUN npm install
COPY admin/src ./src
COPY admin/*.* ./
RUN npm run build

# Backend setup
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Expose ports
EXPOSE 3000 5173

# Start backend
CMD ["npm", "start"]
