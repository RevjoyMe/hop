#!/bin/env bash

docker stop prometheus_client
docker rm prometheus_client

docker run \
  --name prometheus_client \
  --restart=unless-stopped \
  -d \
  -v $PWD/prometheus_client.yml:/etc/prometheus/prometheus.yml \
  -v $PWD/web.yml:/web.yml \
  --net=host \
  -p 9091:9090 \
  prom/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --web.console.libraries=/usr/share/prometheus/console_libraries \
  --web.console.templates=/usr/share/prometheus/consoles \
  --web.config.file=/web.yml \
  --web.listen-address=:9091
