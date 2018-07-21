FROM ubuntu:18.04

RUN apt-get update && apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y --no-install-recommends vim less net-tools inetutils-ping wget curl git telnet nmap socat dnsutils netcat tree htop unzip sudo software-properties-common jq psmisc python ssh rsync gettext-base
RUN apt-get install -y python3-pip
RUN sudo pip3 install pipenv
RUN git clone https://github.com/nucypher/pyUmbral.git
ENV LANGUAGE=en_US.UTF-8 LC_ALL=C.UTF-8 LANG=C.UTF-8
WORKDIR /pyUmbral
RUN pipenv install --system --deploy --ignore-pipfile
RUN python3 setup.py install

RUN wget -O - https://nodejs.org/dist/v8.11.0/node-v8.11.0-linux-x64.tar.gz | tar xz
RUN mv node* node
ENV PATH $PATH:/node/bin
RUN apt-get install -y npm

RUN mkdir /impulse
WORKDIR /impulse
COPY . /impulse
RUN npm --unsafe-perm install

CMD ["node", "app.js"]
