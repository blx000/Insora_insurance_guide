FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY . .

EXPOSE 3001 4173
