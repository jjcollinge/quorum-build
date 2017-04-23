FROM ubuntu:16.10

RUN apt-get update && \
    apt-get install -y nodejs npm software-properties-common python-software-properties apt-transport-https ca-certificates && \
    apt-key adv --keyserver hkp://ha.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D && \
    echo "deb https://apt.dockerproject.org/repo ubuntu-xenial main" | tee /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y docker-engine && \
    service docker start

COPY . /source
RUN chmod +x /source/run.sh /source/build-extract.sh /source/build-upload.js && \
    cd /source && \
    ln -s "$(which nodejs)" /usr/bin/node && \
    npm install

WORKDIR /source

ENTRYPOINT ["./run.sh"]
