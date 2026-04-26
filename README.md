# DeviceGalaxy

DeviceGalaxy is a tool that lets you upload and share your devices. Upload your devices, select images, then share your collection with other people with share links.

## Using DeviceGalaxy

To use DeviceGalaxy, you have 3 options.

### Using the hosted instance

If you don't want to self host, you can use the instance that I host at https://devicegalaxy.me

### Self hosting (Docker, recommended)

DeviceGalaxy can be ran as a Docker container. This ensures the same base OS and packages for DeviceGalaxy to use, no matter your system. To use it, follow these steps:

1. download the `docker-compose.yml` file and `.env.example` file. Inside the example env file, set all required variables, then rename the file to `.env`.
2. inside the compose file, change the external port / labels / version to your requirements.
3. run `docker compose up -d` to pull and run DeviceGalaxy in detached mode.

### Self hosting (bare metal)

If you want to self host your own instance of DeviceGalaxy, follow these instructions:

1. pull the repo from GitHub
2. run `pnpm install` to install dependencies
3. copy the example `.env.example` file to `.env`, then fill in the required information
4. run `pnpm db:migrate` to create the database and required tables
5. run `pnpm build` to build the project
6. run `node --env-file=.env build` to run the server

## Developing

If you wish to contribute to DeviceGalaxy, here's how to run the dev server:

1. pull the repo from GitHub
2. run `pnpm install` to install dependencies
3. copy the example `.env.example` file to `.env`, then fill in the required information
4. run `pnpm db:migrate` to create the database and required tables
5. run `pnpm dev` to start the Vite dev server

If you modify the database schema, use `pnpm db:generate` to create a new migration file. Make sure to check it first to ensure it looks correct, then use `pnpm db:migrate` to apply it. It is recommended to format your code using Prettier, and lint with eslint.
