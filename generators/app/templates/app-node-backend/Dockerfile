FROM node:dubnium-alpine

# install required packages
RUN apk update && \
    apk add git \
    && apk add redis \
    && apk add openrc \
    && mkdir /run/openrc && touch /run/openrc/softlevel \
    && apk add openssh \
    && echo "root:Docker!" | chpasswd \
    && rc-update add sshd \
    && rc-update add redis \
    && rc-status

# ssh server settings
RUN echo "Port 2222" >> /etc/ssh/sshd_config && \
    echo "ListenAddress 0.0.0.0" >> /etc/ssh/sshd_config && \
    echo "LoginGraceTime 180" >> /etc/ssh/sshd_config && \
    echo "X11Forwarding yes" >> /etc/ssh/sshd_config && \
    echo "Ciphers aes128-cbc,3des-cbc,aes256-cbc" >> /etc/ssh/sshd_config && \
    echo "MACs hmac-sha1,hmac-sha1-96" >> /etc/ssh/sshd_config && \
    echo "StrictModes yes" >> /etc/ssh/sshd_config && \
    echo "SyslogFacility DAEMON" >> /etc/ssh/sshd_config && \
    echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config && \
    echo "PermitEmptyPasswords no" >> /etc/ssh/sshd_config && \
    echo "PermitRootLogin yes" >> /etc/ssh/sshd_config

# create app directory
WORKDIR /usr/src/app

# install app dependencies a wildcard is used to ensure both package.json
# AND package-lock.json are copied where available (npm@5+)
COPY package*.json ./

# if you are building your code for production
# RUN npm install --only=production
RUN npm install && npm audit fix

# bundle app source
COPY . .

# build the server
RUN npm run build
# build the webapp
# @TODO: implement web app
# RUN cd webapp && npm install && npm audit fix && npm rebuild node-sass && npm run build && cd ..

# expose ports
EXPOSE 2222 80

# start ssh / server
CMD sh -c "/etc/init.d/sshd restart && /etc/init.d/redis restart && npm start"
