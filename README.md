# DeviceGalaxy

DeviceGalaxy is a tool that lets you upload and share your devices. Upload your devices, select images, then share your collection with other people with share links.

## Using DeviceGalaxy

To use DeviceGalaxy, you have 3 options.

### Using the hosted instance

If you don't want to self host, you can use the instance that I host at https://devicegalaxy.me

### Self hosting (Docker, recommended)

DeviceGalaxy can be ran as a Docker container. This ensures the same base OS and packages for DeviceGalaxy to use, no matter your system. To use it, follow these steps:

1. pull the repo from GitHub
2. copy the example `.env.example` file to `.env`. if using docker compose, ensure that the `DATABASE_PATH` and `DATA_PATH` are set to the default values inside the example file
3. if using docker compose, run `docker compose build` to build the container. otherwise, run `docker build`
4. if using docker compose, run `docker compose up -d` to run devicegalaxy. otherwise, run the docker container manually. devicegalaxy runs on port `3000`

### Self hosting (bare metal)

If you want to self host your own instance of DeviceGalaxy, follow these instructions:

1. pull the repo from GitHub
2. run `npm install` to install dependencies
3. copy the example `.env.example` file to `.env`, then fill in the required information
4. run `npm run db:push` to create the database and required tables
5. run `npm run build` to build the project
6. run `node --env-file=.env build` to run the server

## Developing

If you wish to contribute to DeviceGalaxy, here's how to run the dev server:

1. pull the repo from GitHub
2. run `npm install` to install dependencies
3. copy the example `.env.example` file to `.env`, then fill in the required information
4. run `npm run db:push` to create the database and required tables
5. run `npm run dev` to start the Vite dev server

It is recommended to format your code using Prettier, and lint with eslint.
