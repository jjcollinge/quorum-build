const filesystem = require('fs');
const archiver = require('archiver');
const os = require('os');
const azure = require('azure-storage');
const path = require('path');
const exec = require('child_process').exec;

// Constant vars
const localArchiveCacheFolder = ".archives"
const cloudArchiveContainer = "builds";
const args = process.argv;
console.log("args: " + args);

// Extract command line arguments
if (args.length == 4) {
    var artifactsDirectory = args[2];
    var cloudArchiveFileName = args[3];
    var ext = cloudArchiveFileName.substring(cloudArchiveFileName.length - 4)
    if (ext.toLowerCase() != ".zip") {
        cloudArchiveFileName += ".zip";
    }
} else {
    throw "Required arguments not provided."
}

// Extract enviroment variables
if ((process.env.AZURE_STORAGE_ACCESS_KEY && process.env.AZURE_STORAGE_ACCOUNT) || process.env.AZURE_STORAGE_CONNECTION_STRING) {
    // no-op
} else {
    throw "Please set the following environment variables: AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY, or AZURE_STORAGE_CONNECTION_STRING.";
}

// Check local target directory exists
if (!filesystem.existsSync(artifactsDirectory)) {
    throw "Invalid artifacts directory path '" + artifactsDirectory + "'";
}

// Create local cache directory if it doesn't exists
if (!filesystem.existsSync(localArchiveCacheFolder)) {
    filesystem.mkdirSync(localArchiveCacheFolder);
}

// Check file with same name isn't in cache
if (filesystem.existsSync(localArchiveCacheFolder + "/" + cloudArchiveFileName)) {
    throw "A file with the same name already exists in the local cache: '" + localArchiveCacheFolder + "'";
}

// Check if blob with same name exists
var blobService = azure.createBlobService();

// Check whether blob exists
blobService.getBlobProperties(
    cloudArchiveContainer,
    cloudArchiveFileName,
    function (err, properties, status) {
        if (status.isSuccessful) {
            throw "A file with the same name already exists in cloud storage"
        } else {
            // Create the container if it doesn't already exists
            blobService.createContainerIfNotExists(cloudArchiveContainer, {
                publicAccessLevel: 'blob'
            }, function (error, result, response) {
                if (!error) {
                    archiveDirectory(artifactsDirectory, cloudArchiveFileName, function(archive) {
                        uploadArchiveToBlobStorage(archive, cloudArchiveFileName);
                    });
                } else {
                    throw (error);
                }
            });
        }
    });

// Zip up a source directory and store in a specific directory
function archiveDirectory(directoryToZip, zipFileName, callback) {
    var outputDestination = path.join(localArchiveCacheFolder, zipFileName);
    console.log("Creating new archive of " + directoryToZip + " at location " + outputDestination);

    var output = filesystem.createWriteStream(outputDestination);
    var archive = archiver('zip', {
        store: true
    });

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('Archiver has been finalized and the output file descriptor has closed');
        callback(outputDestination);
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);
    archive.directory(directoryToZip);
    archive.finalize();
}

// Send archive file to a remote storage location for safe keeping
function uploadArchiveToBlobStorage(archivePath, blobName) {
    console.log("Uploading " + archivePath + " to Azure Blob Storage");
    blobService.createBlockBlobFromLocalFile(cloudArchiveContainer, blobName, archivePath, function (error, result, response) {
        if (!error) {
            console.log("Successfully uploaded zip to Azure Blob Storage");
            console.log(result)
        } else {
            throw (error)
        }
    });
}


