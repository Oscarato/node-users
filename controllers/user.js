const UsersModel = require('../models/users')
const bcrypt = require('bcryptjs');
const bodyToken = require('../jwt-checker');

/**
 * @description Devuelve un hash encriptado junto a un Salt
 * @param {String} text 
 * @returns String Hash encriptado
 */
const encrypt = (text) => {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(text, salt)
}

const User = {

  /**
   * @description Devuelve una lista de todos los usuarios, tener en cuenta que solo se lista para el roll administrador
   * @param {*} req 
   * @param {*} res 
   * @returns Lista de usuarios
   */
  fetchAll: (req, res) => {

    // Revisamos token
    try {
      let token = req.headers.authorization;
      tokenInfo = bodyToken.payload(token);
    } catch (error) {
      return res.status(401).json('El token es invalido');
    }

    if(tokenInfo.roll == 2){
      return res.status(401).json('No tienes permisos para esta acción');
    }

    UsersModel.find()
      .then((users) => res.json(users))
      .catch((err) => res.status(400).json('Error: ', err));
  },

  /**
   * @description Crea un uusuario con el roll comun 2 desde un usuario administrador
   * @param {*} req 
   * @param {*} res 
   * @returns String - Usuario creado correctamente
   */
  create: (req, res) => {

    let tokenInfo = {};

    // Revisamos token
    try {
      let token = req.headers.authorization;
      tokenInfo = bodyToken.payload(token);
    } catch (error) {
      return res.status(401).json('El token es invalido');
    }

    if(tokenInfo.roll == 2){
      return res.status(401).json('No tienes permisos para esta acción');
    }

    // revisamos que existan los campos necesarios
    if (!req.body.name || !req.body.email || !req.body.password ) {
      return res.json('Los campos "name", "email", "password" son requeridos')
    }

    // buscamos que exista
    UsersModel.findOne({
      email: req.body.email
    })
    .then((user) => {
      if (user) {
        return res.status(400).json('El correo ya se encuentra registrado');
      }

      // Crear usuario - solo usuario común (2)
      const userModel = new UsersModel({
        name: req.body.name,
        email: req.body.email,
        password: encrypt(req.body.password),
        roll: 2, 
        datecreated: Math.floor(Date.now() / 1000)
      });

      userModel.save()
        .then(() => res.json('Usuario creado correctamente'))
        .catch((err) => res.status(400).json('Error: ' + err));
    })

  },

  /**
   * @description Busca el usuario por el id y devuelve un objeto con sus valores
   * @param {*} req 
   * @param {*} res 
   * @returns Object - Retorna un objeto con las propiedades del usuario
   */
  findById: (req, res) => {
    UsersModel.findById(req.params.id)
      .then((user) => res.json(user))
      .catch((err) => res.status(400).json('Error: ' + err));
  },

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  update: async (req, res) => {

    // Revisamos token
    try {
      let token = req.headers.authorization;
      tokenInfo = bodyToken.payload(token);
    } catch (error) {
      return res.status(401).json('El token es invalido');
    }

    // Permisos
    if(tokenInfo.roll == 2 && tokenInfo.id != req.params.id){
      return res.status(401).json('No tienes permisos para esta acción');
    }

    // revisamos que existan los campos necesarios
    if (!req.body.name || !req.body.email) {
      return res.json('Los campos "name", "email" son requeridos')
    }

    let dataUp = {
      name: req.body.name,
      email: req.body.email
    }

    // Se puede actualizar la contraseña si se recibe
    if(req.body.password){
      dataUp.password = encrypt(req.body.password);
    }

    // buscamos que exista el correo
    if(dataUp.email != tokenInfo.email){
      let userExit = await UsersModel.findOne({
        email: req.body.email
      })
      
      if (userExit) {
        return res.status(400).json('El correo ya se encuentra registrado');
      }
      
    }

    // Actualizamos
    UsersModel.findByIdAndUpdate(req.params.id, dataUp, { new: true })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json('Error: ' + err));

  },

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  delete: (req, res) => {

    // Revisamos token
    try {
      let token = req.headers.authorization;
      tokenInfo = bodyToken.payload(token);
    } catch (error) {
      return res.status(401).json('El token es invalido');
    }

    if(tokenInfo.roll == 2){
      return res.status(401).json('No tienes permisos para esta acción');
    }

    UsersModel.findByIdAndDelete(req.params.id)
      .then(() => res.json('Usuario eliminado'))
      .catch((err) => res.status(400).json('Error: ' + err));

  }
}

module.exports = User;