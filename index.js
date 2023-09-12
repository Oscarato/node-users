const express = require('express');
var cors = require('cors')
const mongoose = require('mongoose');
const config = require('./config')();
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const path = require('path');
const fs = require('fs');
// const busboy = require('connect-busboy');
var fileupload = require("express-fileupload");

const app = express();
app.use(cors())

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

    /**
     * Manejo de documentos
     */
    
    app.post('/process-file', async (req, res) => {
      
      if(!req.files){
        return res.status(401).send('No se recibio el archivo');
      }
      // Obtener el archivo del cuerpo de la petición
      const file = req.files.file;

      file.mv(path.join(__dirname+'/uploads/'+file.name), () => {
        // Leer el archivo
        const data = fs.readFileSync(path.join(__dirname+'/uploads/'+file.name), 'utf8');
        // Contar las palabras del archivo
        const wordCount = data.split(' ').length;
        // Mostrar los resultados del procesamiento
        res.send({ wordCount });
      })
      
      
    });

  })
  .catch((err) => console.log(err));


// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(busboy({ immediate: true }));
app.use(fileupload());

// Iniciar el servidor
app.listen(config.port, () => {
  console.log(
    'Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port,
    '\nExpress server listening on port ' + config.port
  );
});