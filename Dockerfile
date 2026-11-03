# builder
FROM --platform=$BUILDPLATFORM node:26.13.0-alpine@sha256:c6ad9e9c1d80f6eb607c26b4b0a132ff7a2344fad1c78ea3baa2a7d4c8de6d94 AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml vite.config.ts tsconfig.json ./

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
FROM --platform=$TARGETPLATFORM node:26.13.0-alpine@sha256:c6ad9e9c1d80f6eb607c26b4b0a132ff7a2344fad1c78ea3baa2a7d4c8de6d94

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
