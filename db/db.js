const mongoose = require("mongoose")
const { DB_CONN } = require('../config')
const Admin = require('../model/admin')
const databaseConnection = async () => {
    mongoose.connect(DB_CONN)
    const db = mongoose.connection
    db.on('error', (err) => console.log('db not connected', err));
    db.on('disconnected', () => console.log('database disconnected'));
    db.on('open', () => {
        console.log('Database connected succesfully.')
        seedAdmins()
    })
}
/* seed Admin Data */
async function seedAdmins() {
    const adminData = 
        {
            name: 'admin',
            email: 'admin@admin.com',
            password: 'password123'
        }
    

    try {
        const exist = await Admin.findOne({email:adminData?.email})
        if(!exist){
            await Admin.create(adminData)
            console.log('Admin data seeded successfully');
        }
        
    } catch (error) {
        console.error('Error seeding admin data:', error);
    }
}
module.exports = databaseConnection