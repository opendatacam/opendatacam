FROM node:alpine

RUN apk add --no-cache git

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN git clone -b 0.3 https://github.com/moovel/lab-opendatacam

COPY static/placeholder/frames/ /usr/src/app/lab-opendatacam/static/placeholder/frames/

# Install app dependencies
WORKDIR /usr/src/app/lab-opendatacam
RUN npm install
RUN npm run build

# seems optional
EXPOSE 8080 8070 8090
# -p 8080:8080 -p 8090:8090 -p 8070:8070

CMD [ "npm", "start" ]