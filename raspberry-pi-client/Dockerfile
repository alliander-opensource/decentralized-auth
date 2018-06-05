FROM node:8.6

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./

RUN yarn

# Bundle app source
COPY . .

CMD [ "yarn", "start" ]
