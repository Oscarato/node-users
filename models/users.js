const mongoose = require('mongoose');

// Definir el esquema de la colección de usuarios
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    roll: String,
    datecreated: String
});
  
// Crear la colección de usuarios
const User = mongoose.model('User', userSchema);

module.exports = User;