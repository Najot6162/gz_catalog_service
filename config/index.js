const config = {
    environment: getConf('NODE_ENV', 'dev'),
    mongoHost: getConf('MONGO_HOST', 'catalog-db'),
    mongoPort: getConf('MONGO_PORT', '27017'),
    mongoUser: getConf('MONGO_USER', 'rj'),
    mongoPassword: getConf('MONGO_PASSWORD', 'mysecret'),
    mongoDatabase: getConf('MONGO_DATABASE', 'catalog_service'),
    RPCPort: getConf('RPC_PORT', 7000),
    cloudUrl: getConf('CLOUD_URL', 'https://sdn.delever.uz/goodzone/')
}

function getConf(name, def = ''){
    if(process.env[name]){
        return process.env[name];
    }
    return def;
}

module.exports = config;