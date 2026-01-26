FROM node:20-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copy package definition
COPY package.json ./

# Install all dependencies (simple + flexible for development)
RUN npm install

# Copy application source
COPY src ./src
COPY schema.sql ./schema.sql
COPY seed.sql ./seed.sql

EXPOSE 8080

CMD ["node", "src/server.js"]
