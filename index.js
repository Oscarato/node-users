const express = require('express');
const mongoose = require('mongoose');
const config = require('./config')();
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const path = require('path');
const fs = require('fs');

const app = express();

// Conectar a la base de datos
mongoose.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/testNode', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {

    const UserController = require('./controllers/user')
    const AdminController = require('./controllers/admin')
    console.log('Conectado a la base de datos')

    // home
    app.get('/', function(req,res) {
      res.sendFile(path.join(__dirname+'/index.html'));
    });

    // Definir rutas de la API
    app.get('/users', UserController.fetchAll);

    /**
     * Crea un usuario administrador
     */
    app.post('/register', AdminController.create);

    /**
     * Obtenemos un token
     */
    app.post('/token', AdminController.login);

    /**
     * Crea los usuarios
     */
    app.post('/users', UserController.create);

    /**
     * Obtiene los usuarios por id
     */
    app.get('/users/:id', UserController.findById);

    /**
     * Actualiza el usuario por el id
     */
    app.put('/users/:id', UserController.update);

    /**
     * Elimina los usuarios
     */
    app.delete('/users/:id', UserController.delete);

    /**
     * Documentación
     */
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  })
  .catch((err) => console.log(err));


// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Iniciar el servidor
app.listen(config.port, () => {
  console.log(
    'Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port,
    '\nExpress server listening on port ' + config.port
  );
});