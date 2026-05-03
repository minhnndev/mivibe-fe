# Stage 1: Build app
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy build output
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./

# Copy template để runtime env inject
RUN cp index.html index.html.template

# Install envsubst (thuộc gói gettext)
RUN apk add --no-cache gettext

# Inject env vars at runtime
ENTRYPOINT ["/bin/sh", "-c", "envsubst < index.html.template > index.html && exec nginx -g 'daemon off;'"]