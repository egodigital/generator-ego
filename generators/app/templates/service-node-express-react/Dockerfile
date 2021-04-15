FROM node:14-alpine

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

# bundle app source
COPY . .

# build app
RUN cd backend && npm install && npm run build && cd ..
RUN cd frontend && npm install && npm rebuild node-sass && npm run build && cd ..

# expose ports
EXPOSE 2222 80

# start
CMD sh -c "/etc/init.d/sshd restart && /etc/init.d/redis restart && cd /usr/src/app/backend && npm start"
