FROM node:carbon

# create app directory
WORKDIR /usr/src/app

# install app dependencies a wildcard is used to ensure both package.json
# AND package-lock.json are copied where available (npm@5+)
COPY package*.json ./

# if you are building your code for production
# RUN npm install --only=production
RUN npm install

# bundle app source
COPY . .

# build the server
RUN npm run build

# expose ports
EXPOSE 80
