FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install the Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 4000 (GraphQL server)
EXPOSE 4000

# Run the application
CMD ["npm", "start"]
