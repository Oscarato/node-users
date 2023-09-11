const UsersModel = require('../models/users')
const jwt = require('jsonwebtoken');
const secret = require('../secret').secret;
const bcrypt = require('bcryptjs');

/**
 * @description Revisa el hash - Encriptación de una sola vía
 * @param {String} password 
 * @param {String} hash 
 * @returns Boolean True si se valido correctamente
 */
const decrypt = (password, hash) => {
  return bcrypt.compareSync(password, hash);
}

const Admin = {

  /**
   * @description Crea un usuario con el roll que se especifica
   * @param {*} req 
   * @param {*} res 
   * @returns String 'Usuario registrado correctamente'
   */
  create: (req, res) => {

    // revisamos que exista el correo y la contraseña
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.roll) {
      return res.json('Los campos "name", "email", "password", "roll" son requeridos')
    }

    // revisamos valores del rol
    if (req.body.roll != 1 && req.body.roll != 2) {
      return res.json('Campo "roll" solo recibe 1 o 2')
    }

    // buscamos que exista
    UsersModel.findOne({
      email: req.body.email
    })
      .then((user) => {
        if (user) {
          return res.status(401).json('El correo ya esta registrado')
        }

        const userCreated = new UsersModel({
          name: req.body.name,
          email: req.body.email,
          password: encrypt(req.body.password),
          roll: req.body.roll, // 1. admin 2. usuario comun
          datecreated: Math.floor(Date.now() / 1000)
        });

        userCreated.save()
          .then(() => res.json('Usuario registrado correctamente'))
          .catch((err) => res.status(400).json('Error: ', err));

      })
  },

  /**
   * @description Permite loguearse con el correo y la contraseña para obtener un Token
   * @param {*} req 
   * @param {*} res 
   * @returns Devuelve un JWT
   */
  login: (req, res) => {

    // revisamos que exista el correo y la contraseña
    if (!req.body.email || !req.body.password) {
      return res.json('Usuario o clave incorrectos')
    }

    // buscamos que exista
    UsersModel.findOne({
      email: req.body.email
    })
    .then((user) => {
      if (user) {
        let checkPass = decrypt(req.body.password, user.password)
        if(checkPass){
          return res.json({
            reponse: true,
            token: jwt.sign({
              id: user.id,
              roll: user.roll,
              email: user.email
            }, secret, {expiresIn: 1200})
          })
        } else {
          return res.json('Usuario o clave incorrectos')
        }

      } else {
        res.status(400).json('El usuario no existe')
      }
    })
    .catch((err) => res.status(401).json('Error: ' + err));
      
  }
}

module.exports = Admin;