FROM node:20-alpine3.22 AS base
WORKDIR /app

# Install OpenSSL 1.1 compatibility for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci
COPY . .

FROM base AS development
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

# Install OpenSSL 1.1 compatibility for Prisma
RUN apk add --no-cache openssl

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start:migrate"]
