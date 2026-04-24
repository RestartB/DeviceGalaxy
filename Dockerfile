# builder
FROM --platform=$BUILDPLATFORM node:25-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN mkdir -p /db && touch /db/data.db
RUN pnpm install --frozen-lockfile

COPY . .
COPY .env.example .env

ARG BUILD_SECRET=building
ENV BETTER_AUTH_SECRET=$BUILD_SECRET

RUN pnpm run build
RUN rm -r /db


# runner
FROM --platform=$TARGETPLATFORM node:25-alpine

WORKDIR /app

RUN npm install -g pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/build build/

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "build"]
