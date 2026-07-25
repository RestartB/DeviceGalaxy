# builder
FROM --platform=$BUILDPLATFORM node:24.18.0-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml svelte.config.js tsconfig.json ./

RUN npm install -g pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN mkdir -p /db && touch /db/data.db
RUN pnpm ci

COPY . .
COPY .env.example .env

ARG BUILD_SECRET=building
ENV BETTER_AUTH_SECRET=$BUILD_SECRET

RUN pnpm run build
RUN rm -r /db


# runner
FROM --platform=$TARGETPLATFORM node:24.18.0-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd

WORKDIR /app

RUN npm install -g pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/build build/
COPY drizzle/ drizzle/

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "build"]
