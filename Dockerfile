# Previous File
# FROM node:14-alpine AS node

#Builder Stage
# FROM node AS builder

# Create app directory
# WORKDIR /armada_app

# Install app dependencies 
# COPY package*.json ./

# RUN npm install

# Bundle app source
# COPY ./ ./

# Build frontend
# RUN npm run build


# Final Stage

# FROM node AS final

# RUN mkdir -p /armada_app/dist

# WORKDIR /armada_app

# COPY --from=builder /armada_app/dist ./dist

# Working Dockerfile - Run npm run build and then build!
FROM node:14-alpine

RUN apk update
RUN apk add nano

RUN mkdir -p /armada_app/dist

WORKDIR /armada_app

# Set Env to Production
ENV NODE_ENV production

# Install app dependencies
COPY package.json ./
COPY --chown=node:node ./dist dist
COPY --chown=node:node ./prisma prisma

RUN npm install
RUN npx prisma generate

RUN chmod 777 ./node_modules/.prisma/client/index.js

EXPOSE 3000
EXPOSE 5432

CMD ["npm", "start" ]