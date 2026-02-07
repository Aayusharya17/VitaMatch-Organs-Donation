const User = require("../models/User");

class userRepository {

    async createUser (data) {
        try {
            const user = await User.create(data);
            return user;
        } catch (error) {
            console.log(error);
            throw new Error('Error in user repository');
        }
    }
    async findUser(data){
        try {
            const user = await User.findOne({email:data.email,role:data.role});
            return user;
        } catch (error) {
            console.log(error);
            throw new Error('Error while logging in');
        }
    }
}

module.exports = userRepository;