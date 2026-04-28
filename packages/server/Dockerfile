# Build context is project root (.)

# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/server/ ./packages/server/
RUN mkdir -p packages/client && echo '{"name":"client","version":"0.0.0","private":true}' > packages/client/package.json
RUN npm ci -w packages/server --include-workspace-root
WORKDIR /app/packages/server
RUN npx prisma generate
RUN npm run build && \
    find dist/generated -name '*.js' -exec sed -i -E \
      -e "s/from '(\.\.?\/[^']+)'/from '\1.js'/g" \
      -e "s/from \"(\.\.?\/[^\"]+)\"/from \"\1.js\"/g" \
      -e "s/\.js\.js/.js/g" \
      {} +

# Stage 2: Production
FROM node:22-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001 -G nodejs
WORKDIR /app
COPY --from=build /app/packages/server/dist ./dist
COPY --from=build /app/packages/server/generated ./generated
COPY --from=build /app/packages/server/prisma ./prisma
COPY --from=build /app/packages/server/package.json ./
RUN npm install --omit=dev
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1
ENV NODE_ENV=production
ENV PORT=3000
CMD ["node", "dist/src/server.js"]
