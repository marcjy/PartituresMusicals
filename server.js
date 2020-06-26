const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const fs = require('fs');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const mime = require('mime');
const { type } = require('os');
const app = express();
const port = 3000;

const IMAGES_FOLDER = __dirname + '/public/uploaded/images/';
const XML_FOLDER = __dirname + '/public/uploaded/xml/';

app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//BBDD
function DataBase() {
  this.isConnected = false;
  this.conn = null;
  this.idUser = null;
  this.createConnection = () => {
    this.conn = mysql.createConnection({
      host: "localhost",
      user: "admin",
      password: "admin",
      database: "scoreFlow"
    });
  }
  this.connectToDataBase = () => {
    this.conn.connect( (err) => {
      if(err) throw err;
      this.isConnected = true;
      console.log("Connected successfully to the data base.");
    });
  }

  this.insertNewUser = (name, password ) => {
    if(!this.isConnected) throw "Not connected to the data base.";

    let sql = 'INSERT INTO User (userName, password) VALUES (?)';
    let escaped = [name, password];

    this.conn.query(sql, [escaped], (err, result) => {
      if(err) throw err;
      console.log("Query successful.\n " + result);
    });
  }
  this.insertNewProject = (userName, projectName, xmlFile, imgFile, imgProject) => {
    if(!this.isConnected) throw "Not connected to the data base.";

    let sql = 'INSERT INTO project (userName, projectName, fileXML, fileIMG, imgProject) VALUES (?)';
    let escaped = [userName, projectName, xmlFile, imgFile, imgProject];

    this.conn.query(sql, [escaped], (err, result) => {
      if(err) throw err;
      console.log("Query successful.\n " + result);
    });

  }
  this.selectFromTable = (elements, table, whereOption, callBack) => {
    let stringElements = "";

    if(!typeof(elements) == "string") {
      for ( let i = 0; i < elements.length; i++) {
        stringElements += elements[i];

        if(i != (elements.length - 1)) { stringElements += ", "; }
      }
    }
    else {
      stringElements = elements;
    }

    let sql = "SELECT " + stringElements + " FROM " + table;

    if(whereOption.length > 0) {
      sql += " WHERE " + whereOption + ";";
    }
    else {
      sql += " ;";
    }

    this.conn.query(sql, (err, result) => {
      if(err) throw err;
      callBack(result);

    });
  }
}

dataBase = new DataBase();
dataBase.createConnection();
dataBase.connectToDataBase();

//Routing
app.get('/', (req, res) => {
  if(req.session.loggedin) { res.redirect('/home'); }
  else { res.sendFile(__dirname + "/public/logIn.html"); }
});

app.post('/upload', (req, res) => { 
  let xmlFile = req.files.xmlFile;
  let imgFile = req.files.imgFile;  

  xmlFile.name = xmlFile.name.replace(/\s/g, '');
  if(Array.isArray(imgFile)) {
  imgFile.forEach(file => { file.name = file.name.replace(/\s/g, ''); });
  } else {
    imgFile.name = imgFile.name.replace(/\s/g, '');
  }

  let images = "";
  let imgProject = null;

  xmlFile.mv(XML_FOLDER + xmlFile.name , (err) => {
    if (err) { return res.status(500).send(err); }
  });

  if(Array.isArray(imgFile)) {
    imgProject = imgFile[0].name;

    for(let i = 0; i < imgFile.length; i++) {
      images += imgFile[i].name;

      if(i != (imgFile.length - 1)) { images += ", "; }

      imgFile[i].mv(IMAGES_FOLDER + imgFile[i].name, err => {
        if(err) { return res.status(500).send(err); }
      });
    }
  }
  else {
    imgProject = imgFile.name;
    images = imgFile.name;

    imgFile.mv(IMAGES_FOLDER + imgFile.name, err => {
      if(err) { return res.status(500).send(err); }
    });
  }

  dataBase.selectFromTable("*", "project", "project.projectName = \'" + req.body.projectName + "\'", (queryResult) => {
    if(queryResult.length > 0) {     
      res.sendFile(__dirname + "/public/projectAlreadyExists.html"); 
    }
    else {
      dataBase.insertNewProject(req.session.username, req.body.projectName, xmlFile.name, images, imgProject);
      res.redirect('/home');
    }
  });
  


});
app.post('/download/:fileXML', (req, res) => {
  let fileName = req.params.fileXML;
  let xmlString = req.body.file;
  let tagXML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">` 

  fs.writeFile(XML_FOLDER + fileName, tagXML + xmlString, err => {
    if(err) { res.status(500).send(err); }

    // let fileStream = fs.createReadStream(XML_FOLDER + fileName);  
    // var mimetype = mime.lookup(fileName);

    // res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    // res.setHeader('Content-type', mimetype);

    // fileStream.pipe(res);
    // console.log("Downloading file...");

    res.download(XML_FOLDER + fileName, fileName, err => {
      if(err) {console.log(err); }
      else {console.log("File downloaded");
      }
    });
  });
 
});

app.get('/xml/:fileXML', (req, res) => {  
  let file = req.params.fileXML;
  
  res.set('Content-Type', 'text/xml');
  res.sendFile(XML_FOLDER + file);
});
app.get('/images/:projectId', (req, res) => {
  let projectId = req.params.projectId; 

  dataBase.selectFromTable("fileIMG", "project", "project.projectId = \'" + projectId + "\'", queryResult => {    
    if(queryResult.length > 0) {      
      res.json(queryResult);
    } else {
      res.json([]);
    }
  });  
});
app.get('/getProjects', (req, res) => {
  let userName = req.session.username;

  dataBase.selectFromTable("*", "Project", "project.userName = \'" + userName + "\'", (queryResult) => {
    if(queryResult.length > 0) {
      res.json(queryResult);
    } 
    else {
      res.json([]);
    }
  });
});

app.get('/home', (req, res) => {
  if(req.session.loggedin) { res.sendFile(__dirname + "/index.html"); }
  else { res.redirect('/'); }
})

app.post('/signin', (req, res) => {
  var userName = req.body.userName;
  var password = req.body.password;

  dataBase.selectFromTable("*", "User", "User.userName = \'" + userName + "\'", (queryResult) => {
    if(queryResult.length > 0) {
      res.sendFile(__dirname + "/public/signInError.html");
    }
    else {      
      bcrypt.hash(password, 10, (err, encrypted) => {
        if(err) throw err;
        dataBase.insertNewUser(userName, encrypted);
      });

      req.session.loggedin = true;
      req.session.username = userName;
      console.log("SignIn successful");
      res.redirect('/home');
    }
  });

});
app.post('/login', (req, res) => {
  var userName = req.body.userName;
  var password = req.body.password;

  dataBase.selectFromTable("password", "User", "User.userName = \'" + userName + "\'", (queryResult) =>{  

    if(queryResult.length > 0) {
      let passwordEncrypted = queryResult[0].password;
      bcrypt.compare(password, passwordEncrypted, (err, result) => {  
        if(err) throw err;

        if(result) {          
          req.session.loggedin = true;
          req.session.username = userName;
          console.log("LogIn successful");
          res.redirect('/home');
        }
        else {
          res.sendFile(__dirname + "/public/logInError.html");
        }
      });
    }
    else {
      res.sendFile(__dirname + "/public/logInError.html");
    }
  });
});
app.get('/logout', (req, res) =>{
  req.session.destroy();
  res.redirect('/');
});
//Creating server
app.listen(port, () => console.log(`Listening in port:  ${port}!`))
