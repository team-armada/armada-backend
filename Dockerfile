FROM node:14-alpine AS node

#Builder Stage
FROM node AS builder

# Create app directory
WORKDIR /armada_app

# Install app dependencies 
COPY package*.json ./

RUN npm install

# Bundle app source
COPY ./ ./

# Build frontend
RUN npm run build


# Final Stage

FROM node AS final

RUN mkdir -p /armada_app/dist

WORKDIR /armada_app

COPY --from=builder /armada_app/dist ./dist

EXPOSE 3000

CMD [ "npm", "start" ]