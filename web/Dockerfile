FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/package.json

RUN pnpm install --frozen-lockfile --filter ./web...

COPY web ./web

WORKDIR /app/web

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "exec", "next", "start", "-p", "3000"]
