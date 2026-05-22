ARG ALPINE_VERSION=3.23

FROM node:24-alpine${ALPINE_VERSION} AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:24-alpine${ALPINE_VERSION} AS backend-builder
WORKDIR /build-stage
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

FROM alpine:${ALPINE_VERSION}
WORKDIR /usr/src/app
RUN apk add --no-cache libstdc++ dumb-init \
  && addgroup -g 1000 node && adduser -u 1000 -G node -s /bin/sh -D node \
  && chown node:node ./
COPY --from=backend-builder /usr/local/bin/node /usr/local/bin/
COPY --from=backend-builder /usr/local/bin/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
USER node
COPY --from=backend-builder /build-stage/node_modules ./node_modules
COPY --from=backend-builder /build-stage/dist ./dist
COPY --from=frontend-builder /frontend/dist ./public
CMD ["dumb-init", "node", "dist/index.js"]