const Category = require('../../models/Category');

let categoryStorage = {
    create: (category) => {
        return new Promise((resolve, reject) => {
            let c = new Category(category);

            c.created_at = Data.now();
            c.updated_at = Date.now();

            c.save((err, cat) => {
                if(err) return reject(err);
                return resolve(cat);
            });
        });
    },
    find: (filters) => {
        return []
    }
}

module.exports = categoryStorage;