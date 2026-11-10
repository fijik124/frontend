FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite embeds this public value in the frontend at build time.
ARG VITE_API_BASE_URL=""
RUN npm run build

FROM nginx:stable-alpine AS production

ENV VITE_API_BASE_URL=https://osk-amk-velky-kliz-backend-owgn5f-243dc8-188-245-125-8.sslip.io/

COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
