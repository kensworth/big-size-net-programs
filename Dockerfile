FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
RUN npm install pm2 -g

# Bundle app source
COPY . /usr/src/app

EXPOSE 8081
CMD [ "npm", "run", "app" ]
