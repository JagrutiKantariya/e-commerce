const { CREATED, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, BAD_GATEWAY } = require('http-status-codes')
const Admin = require('../model/admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const {JWT_ACCESS_SECRET,JWT_ACCESS_TIME} = require('../config')
const adminController = {
    login: async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        if (!email) return res.status(BAD_REQUEST).json({ status: false, message: "email is required" });

        const admin = await Admin.findOne({ email }).exec();

        if (!admin) return res.status().json({ message: 'email not found!' });


        const valid_password = await bcrypt.compare(password, admin.password);
        if (!valid_password) {
           
            return res.status(BAD_REQUEST).json({ status:false,message: 'invalid password!' });
        }
        const accessToken = jwt.sign({ name: admin?.name,email:admin?.email },JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_TIME });
        res.user = admin?._id?.toString()
        const data = {
            name: admin.name,
            accessToken: accessToken
        }

        return res.status(OK).json({status: true,data})
    }
}

module.exports = adminController