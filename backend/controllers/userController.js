const userService = require("../services/userService")
const userServ = new userService;

const signup = async (req,res) => {
    try {
        const token = await userServ.createUser(req.body);
        return res.status(201).json({
            data : token,
            succes : true,
            message : 'User Signed up successfully',
            err : {}
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data : {},
            succes : false,
            message : 'User signup failed',
            err : error
        })
    }
}

const login = async (req,res) => {
    try {
        const token = await userServ.login(req.body);
        return res.status(201).json({
            data : token,
            succes : true,
            message : 'User Logged in successfully',
            err : {}
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data : {},
            succes : false,
            message : 'User Login failed',
            err : error
        })
    }
}

module.exports = {
    signup,
    login
}