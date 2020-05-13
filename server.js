
var musicxml = null;
var imgPartitura = null;



const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

//Routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/uploadForm.html");
});
app.post('/upload', (req, res) => {

  var xmlOk = false;
  var imgOk = false;

  if (!req.files || Object.keys(req.files).length == 0) {
    res.status(400).send('No se ha subido ningun archivo.');
  }
  else {
    musicxml = req.files.musicxml;
    imgPartitura = req.files.imgPartitura;

    musicxml.mv(__dirname + '/uploaded/1.xml', (err) => {
      if (err) {
        return res.status(500).send(err);
      }
    });
    imgPartitura.mv(__dirname + '/uploaded/1.jpeg', (err) => {
      if (err) {
        return res.status(500).send(err);
      }
    });

    res.sendFile(__dirname + "/index.html");
  }
});
app.get('/xml', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.sendFile(__dirname + '/uploaded/1.xml');
});


//Creating server
app.listen(port, () => console.log(`Listening in port:  ${port}!`))
