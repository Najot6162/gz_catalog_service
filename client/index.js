var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/../protos/catalog_service/catalog.proto';
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);
var CatalogProto = grpc.loadPackageDefinition(packageDefinition).genproto;

function main() {
  var client = new CatalogProto.CategoryService('localhost:7000', grpc.credentials.createInsecure());
  var user;
  if (process.argv.length >= 3) {
    user = process.argv[2];
  } else {
    user = 'world';
  }
  client.Create({
      name: 'my category',
      is
  })
}

main();
