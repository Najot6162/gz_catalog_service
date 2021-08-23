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
    minioEndpoint: getConf('MINIO_ENDPOINT', 'cdn.goodzone.uz'),
    minioPort: getConf('MINIO_PORT', 9001),
    minioAccessKeyID: getConf('MINIO_ACCESS_KEY', 'YdrxMxxWQ4B6QXXYYGJbFM6EGttGKCBpUL2qrkV3nV6Kd8Gy5ajHqjy4aqpjtACT'),
    minioSecretAccesKey: getConf('MINIO_SECRET_KEY', 'Hfdxjym6QUjaPUaS2ygf3754xdPRHVunbXhRvncaQXXrnG2kg4dYaquc8WN6KgnJ'),
    ruleServiceHost: getConf('RuleServiceHost', "rules_service"),
    ruleServicePort: getConf('RuleServicePort',"7007")
}

function getConf(name, def = ''){
    if(process.env[name]){
        return process.env[name];
    }
    return def;
}

module.exports = config;