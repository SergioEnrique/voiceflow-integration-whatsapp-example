# Use an official Node.js runtime as the base image
FROM node:20.11.0

# Set the working directory inside the container
WORKDIR /app

# Copy .env from host to container
COPY .env.production /app/.env

# Copy the contents of the "dist" folder from the host into the container
COPY package.json /app
COPY pnpm-lock.yaml /app
COPY dist /app/dist

# Install dependencies
RUN ["corepack", "enable"]
RUN ["corepack", "prepare", "pnpm@8.15.1", "--activate"]
RUN ["pnpm", "install", "--frozen-lockfile", "--prod"]

# Run the specified command when the container starts
CMD ["pnpm", "start"]