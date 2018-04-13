const express = require('express');
const bodyParser = require('body-parser');
const gcm = require('node-gcm');

const mail = require("nodemailer").mail;
var nodemailer = require("nodemailer");
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
//expressApp.use(cors({origin: 'http://localhost:3003'}));
expressApp.use(cors({origin: '*'}));





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


  expressApp.get('/getHorarioAtencion', function(req, res) {
    Promise.all([
    db(`SELECT * FROM horario WHERE tipo = 1 ORDER BY diaNum ASC`),
    db(`SELECT * FROM horario WHERE tipo = 2 ORDER BY diaNum ASC`)
    ]).then((data) => {
        console.log(data);
      
        res.send({data:data});


    }).catch(err => res.send(err).status(500));

  });




  expressApp.get('/getHorarioSemana', function(req, res) {
    Promise.all([
    db(`SELECT r.*, CAST(DATE(r.fecha) AS char) as soloFecha, TIME(r.fecha) as soloHora, DAYNAME(r.fecha) as diaFecha, c.*, (SELECT tc.nombre FROM tipoClase as tc WHERE tc.idTipoClase = c.idTipoClase ) as categoriaClase, 
(SELECT p.nombre FROM profesores as p WHERE p.idProfesor = r.idProfesor) as nombreProfesor FROM clase as c, reservaClase as r 
      WHERE c.pileta = 0 AND c.idClase = r.idClase AND fecha > CURRENT_TIMESTAMP AND fecha < (CURDATE() + INTERVAL 7 DAY) ORDER BY fecha ASC`),
    db(`SELECT r.*, CAST(DATE(r.fecha) AS char) as soloFecha, TIME(r.fecha) as soloHora, DAYNAME(r.fecha) as diaFecha, c.*, (SELECT tc.nombre FROM tipoClase as tc WHERE tc.idTipoClase = c.idTipoClase ) as categoriaClase, 
(SELECT p.nombre FROM profesores as p WHERE p.idProfesor = r.idProfesor) as nombreProfesor FROM clase as c, reservaClase as r 
      WHERE c.pileta = 1 AND c.idClase = r.idClase AND fecha > CURRENT_TIMESTAMP AND fecha < (CURDATE() + INTERVAL 7 DAY) ORDER BY fecha ASC`)
    ]).then((data) => {
        console.log(data);
      
        var groups = _.groupBy(data[0], 'soloFecha');
       

          var groups2 = _.groupBy(data[1], 'soloFecha');
        


        res.send([groups,groups2]);


    }).catch(err => res.send(err).status(500));

  });




  expressApp.get('/getHorarioSemanaw', function(req, res) {

    db(`SELECT r.*, CAST(DATE(r.fecha) AS char) as soloFecha, TIME(r.fecha) as soloHora, DAYNAME(r.fecha) as diaFecha, c.*, (SELECT tc.nombre FROM tipoClase as tc WHERE tc.idTipoClase = c.idTipoClase ) as categoriaClase, 
(SELECT p.nombre FROM profesores as p WHERE p.idProfesor = r.idProfesor) as nombreProfesor FROM clase as c, reservaClase as r 
      WHERE c.idClase = r.idClase AND fecha > CURRENT_TIMESTAMP AND fecha < (CURDATE() + INTERVAL 7 DAY) ORDER BY fecha ASC`).then((data) => {


  var groups = _.groupBy(data, 'soloFecha');
        res.json(groups);
    }).catch(err => res.send(err).status(500));

  });


  expressApp.get('/getSolicitudesEspera', function(req, res) {
    Promise.all([
    db(`SELECT count(idUsuario) FROM usuarios WHERE estadoRutina = 1`),
    db(`SELECT count(idUsuario) FROM usuarios WHERE estado = 0`)
    ]).then((data) => {
        console.log(data);

        res.send(data);


    }).catch(err => res.send(err).status(500));

  });




  expressApp.get('/getSolicitudesEspera', function(req, res) {

    db(`SELECT count(idUsuario) FROM usuarios WHERE estadoRutina = 1`).then((data) => {


  var groups = _.groupBy(data, 'soloFecha');
        res.json(groups);
    }).catch(err => res.send(err).status(500));

  });







  expressApp.get('/getNovedades', function(req, res) {

    db(`SELECT * FROM novedades WHERE estado = 1`).then((data) => {

        res.send({data:data});
    }).catch(err => res.send(err).status(500));

  });


    expressApp.get('/getEquipamento', function(req, res) {

    db(`SELECT * FROM equipamento WHERE estado = 1`).then((data) => {

        res.send({data:data});
    }).catch(err => res.send(err).status(500));

  });


    expressApp.get('/getEquipamentoAll', function(req, res) {

    db(`SELECT * FROM equipamento `).then((data) => {

        res.send({data:data});
    }).catch(err => res.send(err).status(500));

  });


  expressApp.get('/getReservaClase', function(req, res) {

    db(`SELECT c.nombre, rc.idReservaClase, rc.idClase, 
      CAST(DATE(rc.fecha) AS char) as soloFecha, TIME(rc.fecha) as soloHora, 
      DAYNAME(rc.fecha) as diaFecha FROM 
      reservaClase as rc, clase as c 
      WHERE rc.estado = 1 
      AND c.idClase = rc.idClase AND c.reserva = 1 AND rc.fecha > CURRENT_TIMESTAMP`).then((data) => { 
      var groups = _.groupBy(data, 'idClase');
      res.json(groups);
    }).catch(err => res.send(err).status(500));

  });



    expressApp.post('/getEstadistica', (req, res) => {  


    db(`SELECT SUM(a.kgFuerza) as fuerza,  SUM(a.calorias) as calorias,
     SUM(a.duracionAproximada) as minutos FROM actividad as a 
     INNER JOIN ejercicioCompletado  as e ON a.idActividad = e.idActividad WHERE e.idUsuario = ?
`,[req.body.idUsuario]).then((data) => {
      console.log(data);
      if (data) {

          return res.send({data:data});
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });


  expressApp.get('/getUsuariosT', function(req, res) {

    db(`SELECT usuarios.*, 
      CAST(DATE(usuarios.fechaNacimiento) AS char) as soloFecha  FROM usuarios ORDER BY FIELD(estadoRutina, 1, 0, 2)`).then((data) => { 

      res.json(data);
    }).catch(err => res.send(err).status(500));

  });

    expressApp.get('/getUsuariosEstadoOrder', function(req, res) {

    db(`SELECT usuarios.*, 
      CAST(DATE(usuarios.fechaNacimiento) AS char) as soloFecha  FROM usuarios ORDER BY FIELD(estado, 0, 1, 2)`).then((data) => { 

      res.json(data);
    }).catch(err => res.send(err).status(500));

  });


  expressApp.get('/getRutinas', function(req, res) {

    db(`SELECT * FROM rutina`).then((data) => { 

      res.json(data);
    }).catch(err => res.send(err).status(500));

  });



  expressApp.get('/getReservaClase2', function(req, res) {

    db(`SELECT c.nombre, c.color, rc.idReservaClase, rc.idClase, 
      CAST(DATE(rc.fecha) AS char) as soloFecha, TIME(rc.fecha) as soloHora, 
      DAYNAME(rc.fecha) as diaFecha FROM 
      reservaClase as rc, clase as c 
      WHERE rc.estado = 1 
      AND c.idClase = rc.idClase`).then((data) => { 

      res.json(data);
    }).catch(err => res.send(err).status(500));

  });




    expressApp.get('/getClases', function(req, res) {

    db(`SELECT * FROM clase`).then((data) => { 
    //  var groups = _.groupBy(data, 'idClase');
      res.json(data);

    }).catch(err => res.send(err).status(500));

  });
    expressApp.get('/getEjercicios', function(req, res) {

    db(`SELECT * FROM actividad`).then((data) => { 
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



    expressApp.get('/getProfesores', function(req, res) {


    
    db(`SELECT * FROM profesores`)
    .then((data) => { 
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



  expressApp.post('/borrarEjercicioRutina', (req, res) => {

    db(`DELETE FROM rutinaActividad WHERE idRutinaActividad = ? `,[req.body.idRutinaActividad]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
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


  expressApp.post('/getEjerciciosRutina', (req, res) => {

    db(`SELECT ra.*, a.nombre FROM rutinaActividad as ra, actividad as a WHERE
      ra.idActividad = a.idActividad AND ra.idRutina = ?`,[req.body.idRutina]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });



  expressApp.post('/getEjerciciosRutina2', (req, res) => {

    db(`SELECT ra.*, a.nombre FROM rutinaActividad as ra, actividad as a WHERE
      ra.idActividad = a.idActividad AND ra.idRutina = ?`,[req.body.idRutina]).then((data) => {
      console.log(data);
      if (data) {
        var groups = _.groupBy(data, 'diaNumero');
        return res.send(groups);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });




  expressApp.post('/cambiarEstadoClase', (req, res) => {

    db(`UPDATE reservaClase set estado = ? WHERE idReservaClase = ?`,[req.body.estado, req.body.idReserva]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });


  expressApp.post('/guardarProgramacionR', (req, res) => {

var stringValues='';

for(var i=0; i<4; i++){
var datePartido = req.body.fechaCompleta.split(' ');
//console.log(datePartido[0]);
var new_date = moment(datePartido[0]).add((7*(i+1)), 'days').toDate();




console.log(new_date);


var new_date2 =(new_date.toString().split('T')[0]) +' '+datePartido[1];



if(i == 0){
  stringValues+= ' ('+req.body.idClase+','+req.body.idProfesor+',"'+new_date2+'",1) ';
}
else{
  stringValues+= ' ,('+req.body.idClase+','+req.body.idProfesor+',"'+new_date2+'",1) ';
}

}
console.log(stringValues);

    db(`INSERT INTO reservaClase (idClase, idProfesor, fecha, estado) 
        VALUES `+stringValues).then((data) => {
      console.log(data);



      if (data) {
        return res.send({
          data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });

  expressApp.post('/guardarProgramacion', (req, res) => {

    db(`INSERT INTO reservaClase (idClase, idProfesor, fecha, estado) 
        VALUES (?,?,?,?)`,[req.body.idClase, req.body.idProfesor, req.body.fechaCompleta,
        1]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
          data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });

  expressApp.post('/agregarEjercicioRutina', (req, res) => {

    db(`INSERT INTO rutinaActividad (idRutina, idActividad, diaNumero) 
        VALUES (?,?,?)`,[req.body.idRutina, req.body.idActividad, req.body.diaNumero]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
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


  expressApp.post('/nuevoEjercicio', (req, res) => {

    db(`INSERT INTO actividad (nombre, cantidadEjercicio, etiquetaEjercicio, kgFuerza, calorias,
      duracionAproximada, dificultad)  VALUES (?,?,?,?,?,?,?)`,
      [req.body.nombre,
      req.body.cantidadEjercicio,req.body.etiquetaEjercicio,
      req.body.kgFuerza,req.body.calorias,
      req.body.duracionAproximada,req.body.dificultad]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });
  expressApp.post('/nuevoProfesor', (req, res) => {

    db(`INSERT INTO profesores (nombre, estado)  VALUES (?,?)`,
      [req.body.nombre,
      req.body.estado]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });


    expressApp.post('/nuevaMaquina', (req, res) => {

    db(`INSERT INTO equipamento (nombre, descripcion, item1, item2, item3, estado)  VALUES (?,?,?,?,?,?)`,
      [req.body.nombre,
      req.body.descripcion,
      req.body.item1,
      req.body.item2,
      req.body.item3,
      req.body.estado]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });



  expressApp.post('/editarEjercicio', (req, res) => {

    db(`UPDATE actividad SET nombre=?, cantidadEjercicio=?, etiquetaEjercicio=?,kgFuerza=?,calorias=?,
      duracionAproximada=?, dificultad = ? WHERE idActividad = ?`,
      [req.body.nombre,
      req.body.cantidadEjercicio,req.body.etiquetaEjercicio,
      req.body.kgFuerza,req.body.calorias,
      req.body.duracionAproximada,req.body.dificultad,
      req.body.idActividad]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });

  expressApp.post('/editarMaquina', (req, res) => {

    db(`UPDATE equipamento SET nombre=?, descripcion=?, item1=?,item2=?,item3=?,
      estado=? WHERE id = ?`,
      [req.body.nombre,
      req.body.descripcion,req.body.item1,
      req.body.item2,req.body.item3,
      req.body.estado,req.body.id]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });
  expressApp.post('/editarProfesor', (req, res) => {

    db(`UPDATE profesores SET nombre=?, estado=? WHERE idProfesor = ?`,
      [req.body.nombre,req.body.estado,
      req.body.idProfesor]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  })


  expressApp.post('/editarRutina', (req, res) => {

    db(`UPDATE rutina SET nombre=?, diasXSemana=?, dificultad=? WHERE idRutina = ?`,
      [req.body.nombre,
      req.body.diasXSemana,req.body.dificultad,req.body.idRutina]).then((data) => {
      console.log(data);
      if (data) {
        return res.send(data);
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

  expressApp.post('/editarUsuario', (req, res) => {

    db(`UPDATE usuarios SET nombre=?,numeroSocio=?,codigo=?,
      fechaNacimiento=?,email=?, estado=? WHERE idUsuario = ?`,
      [req.body.nombre,
      req.body.numeroSocio,req.body.codigo,
      req.body.fechaNacimiento,req.body.email, req.body.estado,req.body.idUsuario]).then((data) => {
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

  


  expressApp.post('/nuevoUsuario', (req, res) => {

    db(`INSERT INTO usuarios (nombre, numeroSocio, codigo,fechaNacimiento, 
      email) 
        VALUES (?,?,?,?,?)`,
      [req.body.nombre,
      req.body.numeroSocio,req.body.codigo,
      req.body.fechaNacimiento,req.body.email]).then((data) => {
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

expressApp.post('/nuevaRutina', (req, res) => {

    db(`INSERT INTO rutina (nombre, diasXSemana, dificultad) 
        VALUES (?,?,?)`,
      [req.body.nombre,
      req.body.diasXSemana,req.body.dificultad]).then((data) => {
      console.log(data);
      if (data) {
        return res.send({
         data
          });
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });



    expressApp.post('/doLoginApi', (req, res) => {

    db(`SELECT u.idUsuario, u.nombre, u.numeroSocio, u.email, 
      u.fechaNacimiento, u.imagenUrl, 
      (SELECT p.nombre FROM profesores as p INNER JOIN rutinaUsuario as ru ON p.idProfesor = ru.idProfesor WHERE  ru.idUsuario= u.idUsuario AND ru.estado = 1) as profesor FROM usuarios as u  WHERE u.numeroSocio = ? AND 
      u.codigo = 
      ? AND u.estado = 1`,[req.body.firstName,req.body.lastName]).then((data) => {
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



    expressApp.post('/registrarUsuario', (req, res) => {

    db(`INSERT INTO usuarios (nombre, dni, numeroSocio, email) 
        VALUES (?,?,?,?)`,[(req.body.firstName+" "+req.body.lastName), req.body.dni,req.body.dni, req.body.email]).then((data) => {
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

/*
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "gmail.user@gmail.com",
        pass: "userpass"
    }
});
*/
// setup e-mail data with unicode symbols


    expressApp.post('/enviarContra', (req, res) => {

    db(`SELECT codigo FROM usuarios WHERE email = ?`,[req.body.email]).then((data) => {
      console.log(data);
      if (data.length>0) {


/*        var mailOptions = {
          from: "ActionSport<actionSport@app.com>", // sender address
          to: "jralfarog@gmail.com", // list of receivers
          subject: "Codigo de acceso", // Subject line
          text: "Tu codigo de acceso para el app es: 324234.", // plaintext body
          html: "<b>ActionSport</b>" // html body
        }


        smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
              console.log(error);
          }else{
              console.log("Message sent: " + response.message);
          }
          });*/
          mail({
              from: "ActionSport<actionSport@app.com>", // sender address
              to: req.body.email, // list of receivers
              subject: "Codigo de acceso", // Subject line
              html: "<b>ActionSport <br> Tu codigo de acceso para el app es: "+data[0].codigo+"</b>" // html body
          });

        return res.send({
          error: false
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

    expressApp.post('/solicitarRR', (req, res) => {


    db(`UPDATE usuarios SET estadoRutina=? WHERE idUsuario=?`,[req.body.estado,req.body.idUsuario]).then((data) => {
      console.log(data);
      if (data) {
          res.send({data:data});
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });

    expressApp.post('/getRutinaUsuario3', (req, res) => {


    db(`SELECT ru.*, f.nombre FROM rutinaUsuario as ru, rutina as f WHERE ru.idRutina = f.idRutina AND ru.idUsuario = ? AND ru.estado = 1 LIMIT 1`,[req.body.idUsuario]).then((data) => {
      console.log(data);
      if (data) {

          return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });

    expressApp.post('/editarRutinaUsuario', (req, res) => {


    db(`UPDATE rutinaUsuario set idRutina = ? WHERE idRutinaEstado = ?`,[req.body.idRutina, req.body.idRutinaEstado]).then((data) => {
      console.log(data);
      if (data) {

          return res.send(data);
      }
      else{
        return res.send(err).status(500);
      }
      
    }).catch(err => res.send(err).status(500));
  });


    expressApp.post('/asignarRutinaUsuario', (req, res) => {


    Promise.all([db(`INSERT INTO rutinaUsuario (idRutina, idUsuario, idProfesor,estado) 
        VALUES (?,?,1,1)`,[req.body.idRutina, req.body.idUsuario]),db(`UPDATE usuarios 
        SET estadoRutina = 2 WHERE idUsuario = ?`,[req.body.idUsuario])]).then((data) => {

      console.log(data);
      if (data) {

          return res.send(data);
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


    expressApp.post('/siguienteEjercicioUsuario', (req, res) => {
    db(`SELECT ra.*,a.nombre, a.imagenUrl  FROM actividad as a, rutinaActividad as ra 
        WHERE ra.idRutinaActividad NOT IN 
        (         SELECT ec.idRutinaActividad 
        FROM ejercicioCompletado as ec WHERE ec.numeroSemana = YEARWEEK(CURDATE(), 1) 
        AND ec.idUsuario = ? AND ec.idRutinaActividad IS NOT NULL) AND 
        ra.idRutina = (SELECT ru.idRutina FROM rutinaUsuario as ru WHERE ru.idUsuario = ? 
        AND ru.estado = 1) AND a.idActividad = ra.idActividad 
        ORDER BY ra.diaNumero LIMIT 1`,[req.body.idUsuario,req.body.idUsuario]).then((data) => {
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
