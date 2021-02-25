const grpc = require('grpc');
var Minio = require("minio");
const logger = require('../../config/logger');
const cfg = require('../../config');

var minioClient = new Minio.Client({
    endPoint: cfg.minioEndpoint,
    port: cfg.minioPort,
    useSSL: false,
    accessKey: cfg.minioAccessKeyID,
    secretKey: cfg.minioSecretAccesKey,
    region: "us-east-1",
});
const upload = () => {
    const file = __dirname+'/hatch.csv';
    console.log(file);
    // Using fPutObject API upload your file to the bucket europetrip.
    if (file) {
        minioClient.fPutObject('goodzone', 'hatch/samsung_products.csv', file, (err, hatch) => {
            if (err) return console.log(err)
            console.log('File uploaded successfully.')
        });
    } else {
        return console.log("File does not exist");
    }
}
module.exports = { upload };