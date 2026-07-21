FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine AS run
RUN apk upgrade --no-cache && apk add --no-cache "c-ares>=1.34.8-r0"
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY env.template.js /etc/nginx/app-template/config.template.js
COPY docker-entrypoint.d/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
