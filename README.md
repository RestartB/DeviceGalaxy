# DeviceGalaxy

DeviceGalaxy is a tool that lets you upload and share your devices. Upload your devices, select images, then share your collection with other people with share links.

## Using DeviceGalaxy

To use DeviceGalaxy, you have 2 options.

### Using the hosted instance

If you don't want to self host, you can use the instance that I host at https://devices.restartb.xyz

### Self hosting

If you want to self host your own instance of DeviceGalaxy, follow these instructions:

1. pull the repo from GitHub
2. run `npm install` to install dependencies
3. copy the example `.env.example` file to `.env`, then fill in the required information
4. run `npm run db:push` to create the database and required tables
5. run `npm run build` to build the project
6. run `node --env-file=.env build` to run the server

### Developing

If you wish to contribute to DeviceGalaxy, here's how to run the dev server:

1. pull the repo from GitHub
2. run `npm install` to install dependencies
3. copy the example `.env.example` file to `.env`, then fill in the required information
4. run `npm run db:push` to create the database and required tables
5. run `npm run dev` to start the Vite dev server

It is recommended to format your code using Prettier, and lint with eslint.
