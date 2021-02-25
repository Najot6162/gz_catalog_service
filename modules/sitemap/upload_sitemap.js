const grpc = require('grpc');
var Minio = require("minio");
const logger = require('../../config/logger');
const cfg = require('../../config');
const fs = require('fs');

var minioClient = new Minio.Client({
    endPoint: cfg.minioEndpoint,
    port: cfg.minioPort,
    useSSL: false,
    accessKey: cfg.minioAccessKeyID,
    secretKey: cfg.minioSecretAccesKey,
    region: "us-east-1",
});

const uploadSiteMap = () => {
    fs.readFile(__dirname+'/sitemap.xml', (err, data) => {
        if (err) return console.log(err);
        if (data) {
            minioClient.putObject('goodzone', 'sitemap.xml', data,(err, result) => {
                if (err) return console.log(err)
                console.log('File uploaded successfully.')
            });
        } else {
            return console.log("File does not exist");
        }
     });
}
module.exports = { uploadSiteMap };