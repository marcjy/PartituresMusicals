const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const IMAGES_FOLDER = __dirname + '/public/uploaded/images/';
const XML_FOLDER = __dirname + '/public/uploaded/xml/';

app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

//Routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/uploadForm.html");
});
app.post('/upload', (req, res) => {

  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No se ha subido ningun archivo.');
  }
  else {
    let musicxml = req.files.musicxml;
    let imgPartitura = req.files.imgPartitura;

    musicxml.mv(XML_FOLDER + musicxml.name , (err) => {
      if (err) {        
        return res.status(500).send(err);
      }
    });

    for(let i = 0; i < imgPartitura.length; i++) {
      imgPartitura[i].mv(IMAGES_FOLDER + imgPartitura[i].name, err => {
        if(err) {
          return res.status(500).send(err);
        }
      });
    }
  }

/* 
    imgPartitura.mv(__dirname + '/public/uploaded/1.jpg', (err) => {
      if (err) {
        return res.status(500).send(err);
      }
    });
     */
    res.sendFile(__dirname + "/index.html");
});
app.get('/xml', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.sendFile(XML_FOLDER + "BNC-M1683_13_Motet_Laudate_Dominum-P_Llinas (1-3) - 1 Tiple 1.xml");
});
app.get('/images', (req, res) => {
  let images = "";

  fs.readdir(IMAGES_FOLDER, (err, files) => {
    if(err) {
      return res.status(500).send(err);
    } else {
      for(let i = 0; i < files.length - 1; i++) {
        images += "/uploaded/images/" + files[i] + ", ";
      }
      images += "/uploaded/images/" + files[files.length-1];
    }    
    res.send(images);
  });
  
});

//Creating server
app.listen(port, () => console.log(`Listening in port:  ${port}!`))
