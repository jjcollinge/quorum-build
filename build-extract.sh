#!/bin/bash

while getopts n:b:q:c: option
do
        case "${option}"
        in
                n) CONTAINER_NAME=${OPTARG};;
                b) BUILD_DIR=${OPTARG};;
                q) QUORUM_BIN_PATH=${OPTARG};;
                c) CONTELLATION_BIN_PATH=${OPTARG};;
        esac
done

if [[ -z "$CONTAINER_NAME" ]] || [[ -z "$BUILD_DIR" ]]; then
    echo "Required arguments not provided";
    exit 1
fi

CONTAINER_EXISTS=$(docker ps | grep -o $CONTAINER_NAME | wc -l)
if [[ "$CONTAINER_EXISTS" = false ]]; then
    echo "No container matching the provided name '$CONTAINER_NAME' could be found"
    exit 1
fi

mkdir -p $BUILD_DIR

docker cp "$CONTAINER_NAME:$QUORUM_BIN_PATH/bootnode" "$BUILD_DIR/bootnode"
docker cp "$CONTAINER_NAME:$QUORUM_BIN_PATH/geth" "$BUILD_DIR/geth"
docker cp "$CONTAINER_NAME:$CONTELLATION_BIN_PATH/constellation-enclave-keygen" "$BUILD_DIR/constellation-enclave-keygen"
docker cp "$CONTAINER_NAME:$CONTELLATION_BIN_PATH/constellation-node" "$BUILD_DIR/constellation-node"

