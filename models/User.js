const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tokenBalance: { type: Number, default: 0 },
    metaMaskAccount: { type: String },
    submissions: [{
        description: String,
        proof: String,
        status: { type: String, default: 'pending' }
    }]
}, { collection: 'ecotoken' });

module.exports = mongoose.model('User', UserSchema);
