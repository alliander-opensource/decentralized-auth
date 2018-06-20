# Container that serves frontend from backend

FROM node:8.6

# Create app directory
WORKDIR /usr/src/app

# Copy app sources (both frontend and backend)
COPY backend/ .
COPY frontend/ frontend/

# Install
RUN cd frontend && npm install
RUN npm install

ENV IOTA_PROVIDER http://node01.testnet.iotatoken.nl:16265
ENV IOTA_MIN_WEIGHT_MAGNITUDE 10
ENV FRONTEND_DIR frontend/build

CMD [ "npm", "start" ]
