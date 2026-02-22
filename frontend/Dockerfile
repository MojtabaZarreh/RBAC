# FROM node:18-alpine AS build-stage
# WORKDIR /app

# COPY package*.json ./
# RUN npm install --legacy-peer-deps

# COPY . .

# ENV NODE_OPTIONS=--openssl-legacy-provider
# RUN CI=false npm run build

# FROM nginx:stable-alpine
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build-stage /app/build /usr/share/nginx/html

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

FROM node:18-alpine
WORKDIR /app

ENV NODE_OPTIONS=--openssl-legacy-provider

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000
CMD ["npm", "start"]