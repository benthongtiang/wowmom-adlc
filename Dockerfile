FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies (only production)
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose port 3000
EXPOSE 3000

# Set environment variables default (can be overridden)
ENV NODE_ENV=production
ENV PORT=3000

# Start the web server
CMD [ "npm", "start" ]
