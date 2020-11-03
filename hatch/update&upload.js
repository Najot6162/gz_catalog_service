const grpc = require('grpc');
var Minio = require("minio");
const logger = require('../config/logger');
const cfg = require('../config');

var minioClient = new Minio.Client({
    endPoint: cfg.minioEndpoint,
    port: cfg.minioPort,
    useSSL: false,
    accessKey: cfg.minioAccessKeyID1,
    secretKey: cfg.minioSecretAccesKey1,
    region: "us-east-1",
});
const upload = () => {
    const file = __dirname+'/hatch.csv';
    var metaData = {
        'Content-Type': 'text/csv',
        'X-Amz-Meta-Testing': 1234,
        'example': 5678
    }
    console.log(file);
    // Using fPutObject API upload your file to the bucket europetrip.
    if (file) {
        minioClient.fPutObject('goodzone', 'hatch/samsung_products.csv', file, metaData, function (err, hatch) {
            if (err) return console.log(err)
            console.log('File uploaded successfully.')
        });
    } else {
        return console.log("File does not exist");
    }
}
module.exports = { upload };