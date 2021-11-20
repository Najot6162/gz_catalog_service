const LocalityCard = require("../../models/LocalityCard");
let localityCardStorage = {
    checkCustomer: (l) => {
        return new Promise((resolve, reject) => {
            if (!l.number) return reject(new Error("number is not provided"));
            if (!l.phone) return reject(new Error("phone is required"));
            LocalityCard.findOne({
                number: l.number,
                phone: l.phone
            }, (err, lr) => {
                if (err) return reject(err);
                if (!lr) return reject(new Error("Document with phone or number:" + l.phone + " " + l.number + " not found"));
                resolve(lr)
            })
        });
    },
    createVerificationCode: (c) => {
        return new Promise((resolve, reject) => {
            if (!c.code) return reject(new Error("code is not provided"));
            if (!c.phone) return reject(new Error("phone is required"));
            LocalityCard.findOne({
                phone: c.phone
            }, (err, cv) => {

                if (err) return reject(err);
                if (!cv) return reject(new Error("Document with phone or number:" + c.phone + " " + " not found"));
                cv.otp = c.code
                cv.user_id = c.user_id
                cv.save()
                resolve(cv)
            })
        });
    },
    checkVerificationCode: (c) => {
        return new Promise((resolve, reject) => {
            if (!c.code) return reject(new Error("code is not provided"));
            if (!c.phone) return reject(new Error("phone is required"));
            LocalityCard.findOne({
                phone: c.phone
            }, (err, cv) => {
                if (err) return reject(err);
                if (!cv) return reject(new Error("Document with phone or number:" + c.phone + c.code + " " + " not found"));
                if (cv.otp !== c.code) return reject(new Error("wrong code "))
                cv.verified = true
                cv.save()
                resolve(cv.user_id)
            })
        });
    },
    getCustomerCard: (req) => {
        return new Promise((resolve, reject) => {
            if (!(req.user_id)) return reject(new Error("UserId is not given"));

            // let query = {};
            // if (req.id) query.user_id = req.user_id;
            LocalityCard.find({
                user_id: req.user_id
            }, (err, br) => {
                if (err) return reject(err);
                if (!br) return reject(new Error("Document not found"));
                return resolve(br);
            });
        });
    },

};

module.exports = localityCardStorage;