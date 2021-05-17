const grpc = require('grpc');
var Minio = require("minio");
const logger = require('../config/logger');
const cfg = require('../config');

var minioClient = new Minio.Client({
    endPoint: cfg.minioEndpoint,
    port: cfg.minioPort,
    useSSL: false,
    accessKey: cfg.minioAccessKeyID,
    secretKey: cfg.minioSecretAccesKey,
    region: "us-east-1",
});
const upload = (filename, filepath) => {
    // Using fPutObject API upload your file to the bucket europetrip.
    if (filepath) {
        minioClient.fPutObject('goodzone', filename, filepath, (err, hatch) => {
            if (err) return console.log(err)
            console.log('File uploaded successfully.')
        });
    } else {
        return console.log("File does not exist");
    }
}
module.exports = { upload };