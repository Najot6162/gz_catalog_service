const config = {
    environment: getConf('NODE_ENV', 'dev'),
    mongoHost: getConf('MONGO_HOST', 'mongo'),
    mongoPort: getConf('MONGO_PORT', '27017'),
    mongoDatabase: getConf('MONGO_DATABASE', 'catalog_service'),
    RPCPort: getConf('RPC_PORT', 7000)
}

function getConf(name, def = ''){
    if(process.env[name]){
        return process.env[name];
    }
    return def;
}

module.exports = config;