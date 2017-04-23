# Quorum build
Provides an easy way to build and store both quorum and constellation artifacts for reuse elsewhere.

## Requirements
The only requirement to use this tool is to have a machine with Docker (Linux server) installed.

## Usage
Simply clone this repository, rename `example.env.sh` to `env.sh`, open the file and edit the values to your own configuration and then save.

Now run `docker build -t qbuild .` to build the initial Dockerfile.

Finally, run `docker run -v /var/run/docker.sock:/var/run/docker.sock -t qbuild`. This will kick off a Docker container that will build and upload the quorum and constellation binaries to Azure Blob Storage. **NOTE** The quorum binaries are statically linked, however, the constellation binaries do rely on external packages which are not currently bundled with this tool.

## Tips
The `env.sh` file allows you to define both `BUILD_ARGS` and `RUN_ARGS` which will be injected into the docker execution commands. Use these to customise your docker behaviour however you see fit .i.e. `--no-cache` if you want to disable caching.