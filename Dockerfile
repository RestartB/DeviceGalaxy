# builder
FROM --platform=$BUILDPLATFORM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS builder

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
FROM --platform=$TARGETPLATFORM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5

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
