#!/bin/bash -x

echo "Loading environment"
. env.sh

echo "Starting build process"

IMAGE_EXISTS=$(docker images | grep -o $IMAGE_NAME | wc -l)
if [[ "$IMAGE_EXISTS" -eq 0 ]]; then
    # Only build image if needed
    docker build -t $IMAGE_NAME $BUILD_ARGS -f Dockerfile.build .
fi

CONTAINER_EXISTS=$(docker ps -a | grep -o $CONTAINER_NAME | wc -l)
if [[ "$CONTAINER_EXISTS" -eq 1 ]]; then
    # Kill the existing container
    docker rm -f $CONTAINER_NAME
fi

# Build quorum and constellation inside container
docker run --name $CONTAINER_NAME $RUN_ARGS $IMAGE_NAME

# Extract build artefacts from container and dump in directory
./build-extract.sh -n $CONTAINER_NAME -b $BUILD_DIR -q $QUORUM_BIN_PATH -c $CONTELLATION_BIN_PATH

ARTEFACT_LABEL="$ARTEFACT_NAME-$ARTEFACT_TAG-$ARTEFACT_VER"
# Zip up directory and upload to cloud storage
node build-upload.js $BUILD_DIR $ARTEFACT_LABEL

echo "All done"