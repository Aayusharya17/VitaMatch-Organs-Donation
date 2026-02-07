const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT : process.env.PORT,
    JWT_SECRET : process.env.JWT_SECRET,
    OPENCAGE_API_KEY : process.env.OPENCAGE_API_KEY,
    ORS_API_KEY : process.env.ORS_API_KEY
}