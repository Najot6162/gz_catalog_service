const config = {
    environment: getConf('NODE_ENV', 'dev'),
    mongoHost: getConf('MONGO_HOST', '206.81.17.88'),
    mongoPort: getConf('MONGO_PORT', '27017'),
    mongoUser: getConf('MONGO_USER', 'catalog_service'),
    mongoPassword: getConf('MONGO_PASSWORD', 'eS37CqC2wMd6Fwkw'),
    mongoDatabase: getConf('MONGO_DATABASE', 'catalog_service'),
    RPCPort: getConf('RPC_PORT', 7000),
    cloudUrl: getConf('CLOUD_URL', 'https://cdn.goodzone.uz/goodzone/'),
    langs: ['en','ru','uz'],
    lang: getConf('DEFAULT_LANG', 'ru'),
    minioEndpoint: getConf('MINIO_ENDPOINT', 'api.delever.uz'),
    minioEndpoint_1: getConf('MINIO_ENDPOINT', 'cdn.goodzone.uz'),
    minioPort: getConf('MINIO_PORT', 9001),
    minioAccessKeyID: getConf('MINIO_ACCESS_KEY_ID', 'd0097ebbb13854f41d6b4d150ace067b4c860169efc6fafd0e8864f4a7307814'),
    minioSecretAccesKey: getConf('MINIO_SECRET_KEY_ID', '56ee38257eb238304a7dee5a6d59bdf9c57f1fea53e0f400d939bf2aa64090d1'),
    minioAccessKeyID_1: getConf('MINIO_ACCESS_KEY_1', 'YdrxMxxWQ4B6QXXYYGJbFM6EGttGKCBpUL2qrkV3nV6Kd8Gy5ajHqjy4aqpjtACT'),
    minioSecretAccesKey_1: getConf('MINIO_SECRET_KEY_1', 'Hfdxjym6QUjaPUaS2ygf3754xdPRHVunbXhRvncaQXXrnG2kg4dYaquc8WN6KgnJ')
}

function getConf(name, def = ''){
    if(process.env[name]){
        return process.env[name];
    }
    return def;
}

module.exports = config;