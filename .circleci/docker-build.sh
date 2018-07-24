#!/usr/bin/env bash
. ./.circleci/export-env-vars.sh

docker build -f Dockerfile \
    -t "${IMAGE_NAME}:latest" \
    .

docker tag "${IMAGE_NAME}:latest" "${IMAGE_NAME}:${NODE_ENV}"