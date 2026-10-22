# builder
FROM --platform=$BUILDPLATFORM node:24.22.0-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS builder

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
FROM --platform=$TARGETPLATFORM node:24.22.0-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f

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
