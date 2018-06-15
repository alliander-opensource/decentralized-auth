FROM node:8.6

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /

# Bundle app source
COPY . .

RUN npm install

CMD [ "npm", "start" ]
