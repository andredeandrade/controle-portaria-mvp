FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json

RUN pnpm install --frozen-lockfile --filter ./api...

COPY api ./api

WORKDIR /app/api

RUN pnpm prisma:generate && pnpm build

EXPOSE 3333

CMD ["node", "dist/server.js"]
