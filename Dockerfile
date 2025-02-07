# Use the official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the files needed to install the dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port on which the microservice runs
EXPOSE 6002
# Command to run the microservice
CMD ["node", "src/app.js"]