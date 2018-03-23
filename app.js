const express = require('express');
const bodyParser = require('body-parser');
const gcm = require('node-gcm');

const mail = require("nodemailer").mail;
const path = require('path');
const multer  =   require('multer');
const upload = multer();
const cors = require('cors');
const Bcrypt = require('bcrypt');
 var _ = require('underscore');
var moment = require('moment');
const db = require('./config/db');

//var sender = new gcm.Sender('AIzaSyB9NRBjhypcU9QZursZiiJuGJMulaCjEmA');


const app = () => {
  const expressApp = express();
  expressApp.use(bodyParser.urlencoded({ extended: true }));
  expressApp.use(bodyParser.json());
expressApp.use(cors({origin: 'http://localhost:3003'}));





expressApp.set('views', path.join(__dirname, 'views'));
expressApp.set('view engine', 'jade');
//addUsuario
expressApp.use(express.static(path.join(__dirname, 'public')));


  expressApp.get('/getDataHome', function(req, res) {
  /* 
  Proxima clase query

  SELECT rc.*, c.imagenUrl, c.nombre 
  FROM reservaClase as rc, clase as c
  WHERE c.idClase = rc.idClase AND rc.fecha > CURRENT_TIMESTAMP
  ORDER BY rc.fecha ASC LIMIT 1
${req.body.profile_picture}

  */
    Promise.all([
    db(`SELECT rc.*, c.* 
        FROM reservaClase as rc, clase as c
        WHERE c.idClase = rc.idClase AND rc.fecha > CURRENT_TIMESTAMP
        ORDER BY rc.fecha ASC LIMIT 1`),
    db(`SELECT * FROM actividad
        ORDER BY RAND()
        LIMIT 1`)
    ]).then((data) => {
        console.log(data);
        res.json(data);
    }).catch(err => res.send(err).status(500));

  });


  expressApp.get('/getHorarioSemana', function(req, res) {

    db(`SELECT r.*, CAST(DATE(r.fecha) AS char) as soloFecha, TIME(r.fecha) as soloHora, DAYNAME(r.fecha) as diaFecha, c.nombre, c.color, c.duracionMinutos, (SELECT tc.nombre FROM tipoClase as tc WHERE tc.idTipoClase = c.idTipoClase ) as categoriaClase, 
(SELECT p.nombre FROM profesores as p WHERE p.idProfesor = r.idProfesor) as nombreProfesor FROM clase as c, reservaClase as r 
      WHERE c.idClase = r.idClase AND fecha > CURRENT_TIMESTAMP AND fecha < (CURDATE() + INTERVAL 7 DAY) ORDER BY fecha ASC`).then((data) => {


  var groups = _.groupBy(data, 'soloFecha');
        res.json(groups);
    }).catch(err => res.send(err).status(500));

  });

  expressApp.get('/getReservaClase', function(req, res) {

    db(`SELECT c.nombre, rc.idReservaClase, rc.idClase, 
      CAST(DATE(rc.fecha) AS char) as soloFecha, TIME(rc.fecha) as soloHora, 
      DAYNAME(rc.fecha) as diaFecha FROM 
      reservaClase as rc, clase as c 
      WHERE rc.estado = 1 
      AND c.idClase = rc.idClase`).then((data) => { 
      var groups = _.groupBy(data, 'idClase');
      res.json(groups);
    }).catch(err => res.send(err).status(500));

  });


    expressApp.get('/getClases', function(req, res) {

    db(`SELECT * FROM clase`).then((data) => { 
    //  var groups = _.groupBy(data, 'idClase');
      res.json(data);

    }).catch(err => res.send(err).status(500));

  });


    expressApp.get('/getClasesProfesores', function(req, res) {

    Promise.all([
    db(`SELECT * FROM clase WHERE estado = 1`),
    db(`SELECT * FROM profesores WHERE estado = 1`)
    ]).then((data) => { 
    //  var groups = _.groupBy(data, 'idClase');
      res.json(data);

    }).catch(err => res.send(err).status(500));

  });




  expressApp.post('/agregarReserva', (req, res) => {

    db(`INSERT INTO asistenciaClase (idReservaClase, idUsuario) 
        VALUES (?,?)`,[req.body.idReserva,req.body.idUsuario]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data: data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });



  expressApp.post('/cargaHorariosClase', (req, res) => {

    db(`SELECT rc.idReservaClase, 
      CAST(DATE(rc.fecha) AS char) as soloFecha, TIME(rc.fecha) as soloHora,
      rc.estado, 
      (SELECT COUNT(a.idAsistenciaClase) FROM asistenciaClase as a  WHERE rc.idReservaClase = a.idReservaClase) as usuariosAnotados 
      FROM reservaClase as rc  WHERE rc.idClase = ?`,[req.body.idClase]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });



  expressApp.post('/getUsuariosAnotadosClase', (req, res) => {

    db(`SELECT u.idUsuario, u.numeroSocio, u.nombre, ac.estado, ac.fechaCreacion 
      FROM usuarios as u, asistenciaClase as ac WHERE u.idUsuario = ac.idUsuario AND
       ac.idReservaClase = ?`,[req.body.idReserva]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });






  expressApp.post('/nuevaClase', (req, res) => {

    db(`INSERT INTO clase (nombre, kgF, calorias,duracionMinutos, 
      beneficio,dificultad,color,estado) 
        VALUES (?,?,?,?,?,?,?,?)`,
      [req.body.nombre,
      req.body.kgF,req.body.calorias,
      req.body.duracionMinutos,req.body.beneficio,
      req.body.dificultad,req.body.color,
      req.body.estado]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data: data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });


  expressApp.post('/editarClase', (req, res) => {

    db(`UPDATE clase SET nombre=?,kgF=?,calorias=?,
      duracionMinutos=?,beneficio=?, 
      dificultad=?, color=?, estado=? WHERE idClase = ?`,
      [req.body.nombre,
      req.body.kgF,req.body.calorias,
      req.body.duracionMinutos,req.body.beneficio,
      req.body.dificultad,req.body.color,
      req.body.estado,req.body.idClase]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data: data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });


  



    expressApp.post('/doLoginApi', (req, res) => {

    db(`SELECT idUsuario, nombre, numeroSocio, email, imagenUrl FROM usuarios WHERE numeroSocio = ? AND 
      codigo = ? AND estado = 1`,[req.body.firstName,req.body.lastName]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data: data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });

    expressApp.post('/getRutinaUsuario', (req, res) => {
   
    Promise.all([
      
      db(`SELECT a.nombre, ra.idActividad, ra.diaNumero, 
    (SELECT ec.idEjercicioCompletado 
      FROM  ejercicioCompletado as ec WHERE ec.idRutinaActividad = ra.idRutinaActividad AND 
      ec.numeroSemana = YEARWEEK(CURDATE(), 1) LIMIT 1) as completado 
    FROM actividad as a, rutinaActividad as ra, rutinaUsuario as ru  
    WHERE ru.idUsuario = ? AND ru.estado = 1 AND 
    ru.idRutina = ra.idRutina AND a.idActividad = ra.idActividad`,[req.body.idUsuario]),
      db(`SELECT ra.*,a.nombre, a.imagenUrl  FROM actividad as a, rutinaActividad as ra 
        WHERE ra.idRutinaActividad NOT IN 
        (         SELECT ec.idRutinaActividad 
        FROM ejercicioCompletado as ec WHERE ec.numeroSemana = YEARWEEK(CURDATE(), 1) 
        AND ec.idUsuario = ? AND ec.idRutinaActividad IS NOT NULL) AND 
        ra.idRutina = (SELECT ru.idRutina FROM rutinaUsuario as ru WHERE ru.idUsuario = ? 
        AND ru.estado = 1) AND a.idActividad = ra.idActividad 
        ORDER BY ra.diaNumero LIMIT 1
        `,[req.body.idUsuario,req.body.idUsuario])
    ]).then((data) => {

      if (data) {
          let aEnviar = [];
          var groups = _.groupBy(data[0], 'diaNumero');
          aEnviar.push(groups);
          aEnviar.push(data[1]);

          res.json(aEnviar);
         // res.json();
      }
      else{
        return res.send(err).status(500);
      }
    }).catch(err => res.send(err).status(500));
  });


    expressApp.post('/getActividadData', (req, res) => {
    db(`SELECT * FROM actividad WHERE idActividad = ?`,[req.body.idActividad]).then((data) => {
      console.log(data);
      if (data) {
          res.json(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });

    expressApp.post('/getRutinaUsuario2', (req, res) => {


    db(`SELECT a.nombre, ra.idActividad, ra.diaNumero, 
    (SELECT ec.idEjercicioCompletado 
      FROM  ejercicioCompletado as ec WHERE ec.idRutinaActividad = ra.idRutinaActividad AND 
      ec.numeroSemana = YEARWEEK(CURDATE(), 1) LIMIT 1) as completado 
    FROM actividad as a, rutinaActividad as ra, rutinaUsuario as ru  
    WHERE ru.idUsuario = ? AND ru.estado = 1 AND 
    ru.idRutina = ra.idRutina AND a.idActividad = ra.idActividad`,[req.body.idUsuario]).then((data) => {
      console.log(data);
      if (data) {

          var groups = _.groupBy(data, 'diaNumero');
          res.json(groups);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });

  expressApp.post('/completarEjercicio', (req, res) => {


    db(`INSERT INTO ejercicioCompletado (idUsuario, idActividad) 
        VALUES (?,?)`,[req.body.idUsuario,req.body.idActividad]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data: data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });

    expressApp.post('/completarEjercicio3', (req, res) => {


    db(`INSERT INTO ejercicioCompletado (idUsuario, idActividad, idRutinaActividad, numeroSemana) 
        VALUES (?,?,(  SELECT ra.idRutinaActividad FROM 
                        rutinaActividad as ra WHERE ra.idRutina = 
                        (SELECT idRutina FROM rutinaUsuario as ru WHERE ru.idUsuario = ? 
                        AND ru.estado = 1 LIMIT 1) AND 
                        ra.idActividad = ? 
                        ORDER BY diaNumero, idRutinaActividad ASC LIMIT 1),YEARWEEK(CURDATE(), 1))`,[req.body.idUsuario,req.body.idActividad,req.body.idUsuario,req.body.idActividad]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data: data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });




    expressApp.post('/getClassdsdesReserva', (req, res) => {
    db(`SELECT c.nombre, rc.idReservaClase, rc.idClase, 
      CAST(DATE(rc.fecha) AS char) as soloFecha, TIME(rc.fecha) as soloHora, 
      DAYNAME(rc.fecha) as diaFecha FROM 
      reservaClase as rc, clase as c 
      WHERE rc.estado = 1 
      AND c.idClase = rc.idClase`,[req.body.idUsuario,req.body.idActividad,req.body.idRutina]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data: data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });




    expressApp.post('/completarEjercicio2', (req, res) => {
    db(`INSERT INTO ejercicioCompletado (idUsuario, idActividad, idRutinaActividad, numeroSemana) 
        VALUES (?,?,?,YEARWEEK(CURDATE(), 1))`,[req.body.idUsuario,req.body.idActividad,req.body.idRutina]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data: data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });



    expressApp.post('/verificarReserva', (req, res) => {


    db(`INSERT INTO asistenciaClase`,[req.body.id]).then((data) => {


      console.log(data);

      if (data) {
        return res.send({
          data: data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });



///////********************************END PRODUCTION ****************
//**************DEVELOP******

//************* T E S T  ____ C O D E  ____******
 expressApp.post('/addUserFb', (req, res) => {
console.log(req.body);
    db(`INSERT INTO usuarios (email, nombre, fbId, imagenUrl) 
        VALUES (?,?,?,?)
        `,[req.body.email, req.body.name, req.body.userID, req.body.picture])
      .then((data) => {
        console.log(data);
        if (!data) {res.send().status(500);}
        return res.send({ insertId: data.insertId });
      }).catch(err => res.send(err).status(500));
  });



 

  expressApp.get('/deletepubli/:idPublicacion', function(req, res) {
     db(`DELETE FROM publicaciones WHERE idPublicacion = ${req.params.idPublicacion}`)
      .then((data) => {
        if (!data) res.send({ msg:'error: '});
        return res.send({ msg: '' });

      }).catch(err => res.send(err).status(500));
  });

  expressApp.post('/addPush', (req, res) => {
    db(`INSERT INTO pushHandler (idUsuario, so, pushKey, deviceID) 
        VALUES (?, ?, ?, ?)
        `,[req.body.user, req.body.device, req.body.pushK, req.body.deviceId])
      .then((data) => {
        if (!data) res.send().status(500);
        return res.send({ insertId: data.insertId });
      }).catch(err => res.send(err).status(500));
  });

  expressApp.get('/enviarTexto/:palabraClave/:usuario', (req, res) => {

    Promise.all([
      db(`SELECT pushKey
        FROM pushHandler  
        WHERE  idUsuario = ${req.params.usuario}
      `)
    ]).then((data) => {

       console.log(data[0]);


      var registrationTokens = [];
        data[0].forEach(function(element) {
          console.log(element.pushKey);
          registrationTokens.push(element.pushKey);
        });


        if(registrationTokens.length > 0){
          console.log('d');
          var message = new gcm.Message({
              data: {
              key1: req.params.palabraClave
              },
              notification: {
                  title: "Nueva Palabra",
                  icon: "ic_launcher",
                  body: " "
              }
          });

          sender.sendNoRetry(message, { registrationTokens: registrationTokens }, function(err, response) {
                  if(err) console.error(err);
                  else    console.log(response);
                });

        }

      if (!data) res.send().status(500);
      return res.send({ insertId: 1 });

    }).catch(err => res.send(err).status(500));

  });



  expressApp.post('/cambiarFotoPerfil',upload.single('file'), (req, res) => {
   
//console.log(req.body.idUsuario);
console.log('**************');
    //console.log(req.file);
var nombreV = 'user'+req.body.idUsuario;
    //console.log(req.body);
    //var img = req.file;
   // res.send({ insertId: data.insertId });

    amazonS3.uploadFile({name: nombreV, body: req.file.buffer}).then(function(data){
        if (!data) res.send().status(500);
        return res.send(data);
    }).catch(err => res.send(err).status(500));

   });



 expressApp.post('/cambiarFotoPublicacion',upload.single('file'), (req, res) => {
   
//console.log(req.body.idUsuario);
console.log('******cambiarfotoPu********');
    //console.log(req.file);
var nombreV = 'publicacion'+req.body.idPublicacion;
    //console.log(req.body);
    //var img = req.file;
   // res.send({ insertId: data.insertId });

    amazonS3.uploadFile({name: nombreV, body: req.file.buffer}).then(function(data){
        if (!data) res.send().status(500);
        return res.send(data);
    }).catch(err => res.send(err).status(500));

   });



/*  expressApp.get('/', (req, res) =>
    res.send('Api is running in port 3000'));*/

  return expressApp.listen(
    3003,
    () => console.log('Connection has been established successfully.')
  );
};

module.exports = app();
