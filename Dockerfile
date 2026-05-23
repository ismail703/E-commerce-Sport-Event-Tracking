# Use the official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /ecommerce-app

# Copy package files and install dependencies
# We do this first to take advantage of Docker layer caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the Next.js application
RUN npm run build

# Create the logs directory so it exists when the app starts
RUN mkdir -p /ecommerce-app/logs

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]