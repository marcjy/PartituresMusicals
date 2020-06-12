const ONE_SECOND = 1000;

const TAG_NOT_FOUND = "T404";
const TYPE_TAG_UNKNOWN = "DT404";

const N_MEASURES = 5
const NEXT_GROUP_MEASURES = "next";
const PREVIOUS_GROUP_MEASURES = "previous";

const SVG_WITDH = getBrowserWidth() - 75;      //For adapting svg size to the client
const SVG_HEIGHT = 350;
const SVG_MARGIN_LEFT = 50;
const MEASURE_HEIGHT = 125;
const MEASURE_WIDTH = SVG_WITDH/6 - 15;

function getBrowserWidth() {      
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}
function getTagFromChildren(tag, children) {
  let elements = [];

  for(let i = 0; i < children.length; i++) {

    if(children[i].nodeName == tag) {      
      elements.push(children[i]);
    }
  }
  if(elements.length == 0) {  //Tag not found
    elements = TAG_NOT_FOUND;
  }

  if(elements.length == 1) {    //Array to single element
    elements = elements[0];
  }
  return elements;
}
//Class XMLManager
function XMLManager() {
  this.parser = new DOMParser();
  this.xml = null;

  /*TODO*/this.sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  this.fetchXML = () => {
    fetch('/xml')
      .then(res => res.text())
      .then(text => { this.xml = this.parser.parseFromString(text, "application/xml"); });
  }
  this.getMeasures = async () => {
    await this.sleep(ONE_SECOND);    
    return this.xml.getElementsByTagName('measure');
  }
}
//Class Note
function Note(data) {
  this.data = data;

  this.isRest = false;
  this.hasDot = false;
  this.duration = null;
  this.voice = null;
  this.type = null;
  this.accidental = null;
  this.pitch = {
    step: null,
    octave: null,
  };
  this.tie = null;

/* TODO  this.setData = data => this.data = data;
  this.setIsRest = isRest => this.IsRest = isRest;
  this.setDuration = duration => this.duration = duration;
  this.setVoice = voice => this.voice = voice;
  this.setType = type => this.type = type;
  this.setAccidental = accidental => this.accidental = accidental;
  this.setPitch = pitch => this.pitch  =pitch;
  this.setNotations = notations => this.notations = notations; */

  this.loadData = () => {    
    let noteChildren = this.data.children;

    if(getTagFromChildren("rest", noteChildren) != TAG_NOT_FOUND) {
      this.isRest = true;
    }
    if(getTagFromChildren("dot", noteChildren) != TAG_NOT_FOUND) {
      this.hasDot = true;
    }
    this.duration = (getTagFromChildren("duration", noteChildren)).innerHTML;
    this.voice = (getTagFromChildren("voice", noteChildren)).innerHTML;
    this.type = (getTagFromChildren("type", noteChildren)).innerHTML;

    if(getTagFromChildren("accidental", noteChildren) != TAG_NOT_FOUND) {   //Accidental tag is optional
      this.accidental = (getTagFromChildren("accidental", noteChildren)).innerHTML; 
    }
    if(getTagFromChildren("notations", noteChildren) != TAG_NOT_FOUND) {   //Notations tag is optional 
      let notationsChildren = getTagFromChildren("notations", noteChildren).children;
      
      if(getTagFromChildren("slur", notationsChildren) != TAG_NOT_FOUND) { 

        let notationsAttributes = getTagFromChildren("slur", notationsChildren).attributes;
        
        for(let i = 0; i < notationsAttributes.length; i++) {          
          if(notationsAttributes[i].name == "type") {
            this.tie = notationsAttributes[i].value;
          }
        }
      } else if(getTagFromChildren("tied", notationsChildren) != TAG_NOT_FOUND) {
        let notationsAttributes = getTagFromChildren("tied", notationsChildren).attributes;
        for(let i = 0; i < notationsAttributes.length; i++) {
          if(notationsAttributes[i].name == "type") {
            this.tie = notationsAttributes[i].value;
          }
        }
      }
    }
    if(this.isRest == false) {     //If isRest == true  -> There is no pitch tag
      this.pitch.step = (getTagFromChildren("step", getTagFromChildren("pitch", noteChildren).children)).innerHTML;
      this.pitch.octave = (getTagFromChildren("octave", getTagFromChildren("pitch", noteChildren).children)).innerHTML;
    }     
  }  

  this.getData = () => this.data;
  this.getIsRest = () => this.isRest;
  this.getHasDot = () => this.hasDot;
  this.getDuration = () => this.duration;
  this.getVoice = () => this.voice;
  this.getType = () => this.type;
  this.getAccidental = () => this.accidental;
  this.getStep = () => this.pitch.step;
  this.getOctave = () => this.pitch.octave;
  this.getTie = () => this.tie;
}
//Class Attributes
function Attributes() {
  this.data = null;

  this.divisions = null;
  this.key = {
    fifths: null,
    mode: null,
  };
  this.time = {
    beats: null,
    beatType: null,
  };
  this.clef = {
    sign: null,
    line: null
  };

  this.loadData = () => {
    var attrChildren = this.data.children;          
    
    if(getTagFromChildren("divisions", attrChildren) != TAG_NOT_FOUND) { this.divisions = (getTagFromChildren("divisions", attrChildren)).innerHTML;}
    if(getTagFromChildren("key", attrChildren) != TAG_NOT_FOUND) {             
      this.key.fifths = (getTagFromChildren("fifths", (getTagFromChildren("key", attrChildren)).children)).innerHTML;
      this.key.mode =  (getTagFromChildren("mode", (getTagFromChildren("key", attrChildren)).children)).innerHTML;
    }
    if(getTagFromChildren("time", attrChildren) != TAG_NOT_FOUND) {
      this.time.beats = (getTagFromChildren("beats", (getTagFromChildren("time", attrChildren)).children)).innerHTML;
      this.time.beatType = (getTagFromChildren("beat-type", (getTagFromChildren("time", attrChildren)).children)).innerHTML; 
    }
    if(getTagFromChildren("clef", attrChildren) != TAG_NOT_FOUND) { 
      this.clef.sign = (getTagFromChildren("sign", (getTagFromChildren("clef", attrChildren)).children)).innerHTML; 
      this.clef.line = (getTagFromChildren("line", (getTagFromChildren("clef", attrChildren)).children)).innerHTML;
  }  
}

  this.setData = (data) => this.data = data;
  this.setClef = (clef) => this.clef = clef;

  this.getData = () => this.data;
  this.getDivisions = () => this.divisions;
  this.getFifths = () => this.key.fifths;
  this.getMode = () => this.key.mode;
  this.getBeats = () => this.time.beats;
  this.getBeatType = () => this.time.beatType;
  this.getSign = () => this.clef.sign;
  this.getLine = () => this.clef.line;
}
//Class TieGenerator
function TieGenerator() {
  this.start = null;
  this.end = null;
  this.finished = false;

  this.createTie = () => {    
    let tie = new VF.StaveTie({
      first_note: this.start,
      last_note: this.end,
      first_indices: [0],
      last_indices: [0]
    });    

    this.start = null;
    this.end = null;
    this.finished = true;

    return tie;
  }
  this.setStart = start => { this.start = start; this.finished = false; }
  this.setEnd = end => this.end = end;
  this.getFinished = () => this.finished;
}
//Class MusicXMLToVexFlow
function MusicXMLToVexFlow() {
  this.translateClef = (sign, line) => {
    let clef = "";

    switch(sign) {
      case "F":
        if(line == "4") {
          clef = "bass";
        } else {
          if(line == "3") {
            clef = "baritone-f";
          } else {
            console.log("Error in translateClef. Unknown CLEF: "+ sign + "/" + line);
          }
        }
        break;
      case "G":
        if(line == "2") {
          clef = "treble";
        } else {
          console.log("Error in translateClef. Unknown CLEF: "+ sign + "/" + line);
        }
        break;
      case "C":
        if(line == "3") {
          clef = "alto";
        } else {
          if(line == "4") {
            clef = "tenor";
          } else {
            if( line == "1") {
              clef = "soprano";
            } else {
              if( line == "2") {
                clef = "mezzo-soprano";
              } else {
                if(line == "5") {
                  clef = "baritone-c"
                }
              }
            }
          }
        }
        break;
      case "percussion":
        clef = "percussion";
        break;
      default:
        console.log("Error in translateClef. Unknown SIGN: " + sign);
    }

    return clef;
  }
  this.translateTimeSignature = (beats, beatsType) => {
    return beats + "/" + beatsType;
  }
  this.translateKeySignature = (fifths, mode) => {
    let keySignature = "";
    
    switch(fifths) {
        case "-7":
          if(mode == "major") { keySignature = "Cb"}
          else {keySignature = "Abm"}
          break;
        case "-6":
          if(mode == "major") { keySignature = "Gb"}
          else { keySignature = "Ebm"}
          break;
        case "-5":
          if(mode == "major") { keySignature = "Db"}
          else { keySignature = "Bbm"}
          break;
        case "-4":
          if(mode == "major") { keySignature = "Ab"}
          else { keySignature = "Fm"}
          break;
        case "-3":
          if(mode == "major") { keySignature = "Eb"}
          else { keySignature = "Cm"}
          break;
        case "-2":
          if(mode == "major") { keySignature = "Bb"}
          else { keySignature = "Gm"}
          break;
        case "-1":
          if(mode == "major") { keySignature = "F"}
          else { keySignature = "Dm"}
          break;
        case "0":
          if(mode == "major") { keySignature = "C"}
          else { keySignature = "Am"}
          break;
        case "1":
          if(mode == "major") { keySignature = "G"}
          else { keySignature = "Em"}
          break;
        case "2":
          if(mode == "major") { keySignature = "D"}
          else { keySignature = "Bm"}
          break;
        case "3":
          if(mode == "major") { keySignature = "A"}
          else { keySignature = "F#m"}
          break;
        case "4":
          if(mode == "major") { keySignature = "E"}
          else { keySignature = "C#m"}
          break;
        case "5":
          if(mode == "major") { keySignature = "B"}
          else { keySignature = "G#m"}
          break;
        case "6":
          if(mode == "major") { keySignature = "F#"}
          else { keySignature = "D#m"}
          break;
        case "7":
          if(mode == "major") { keySignature = "C#"}
          else { keySignature = "A#m"}
          break;
        default:
          console.log("Error in translateKeySignature. Unknown keySignature.\n Fifths: " + fifths + "\n Mode: " + mode);
          break;       
    }

    return keySignature;
  }
  this.translateAccidental = (acc) => {
    let accidental = "";

    switch(acc) {
      case "sharp":
        accidental = "#";
        break;
      case "flat":
        accidental = "b";
        break;
      case "natural":
        accidental = "n";
        break;
      case "double-sharp":
        accidental = "##";
        break;
      case "flat-flat":
        accidental = "bb";
        break;
      default:
        console.log("Error in translateAccidental. Unknown ACCIDENTAL: " + acc);
    }

    return accidental;
  }
  this.translateType = (type) => {
    let duration = "";

    switch(type) {
      case "whole":
        duration = "w";
        break;
      case "half":        
        duration =  "h";
        break;
      case "quarter":
        duration = "q";
        break;
      case "eighth":
        duration = "8";
        break;
      case "16th":
        duration = "16";
        break;
      case "32nd":
        duration = "32";
        break;
      case "64th":
        duration = "64";
        break;
      case "128th":
        duration = "128";
        break;
      default:
        duration = TYPE_TAG_UNKNOWN;
    }
    return duration;
  }
  this.translateDuration = (divisions, duration) => {
    let res = duration / divisions;    
    let realDuration = "";

    switch(res) {
      case 8:
        realDuration = "1/2";
      case 4:
        realDuration = "w";
        break;
      case 2:
        realDuration = "h";
        break;
      case 1:
        realDuration = "q";
        break;
      case 0,5:
        realDuration = "8";
        break;
      case 0,25:
        realDuration = "16";
        break;
      case 0,125:
        realDuration = "32";
        break;
      case 0,0625:
        realDuration = "64";
        break;
      case 0,03125:
        realDuration = "128";
        break;
      case 0,015625:
        realDuration = "b";
        break;
      default:
        console.log("Error in translateDuration. Unknown DURATION: " + res); 
    }

    return realDuration;
  }
  this.translateKey = (step, octave, accidental) => {
    
    let result = "";

    result += step.toLowerCase();
    if(accidental != null) {
      result += accidental;
    }
    result += "/" + octave;

    return result;
  }
}
//Class AlphabeticToMusicXML
function AlphabeticToMusicXML() {
  this.translateClef = (clef) => {
    var res = {
      sign: null,
      line: null
    }
    var sign = null;
    var line = null;

    switch(clef) {
      case "Treble":
          sign = "G";
          line = "2";
        break;
      case "Bass":
          sign = "F";
          line = "4";
        break;
      case "Baritone-F":
          sign = "F";
          line = "3";
        break;
      case "Alto":
          sign = "C";
          line = "3";
        break;
      case "Tenor":
          sign = "C";
          line = "4";
        break;
      case "Soprano":
          sign = "C";
          line = "1";
        break;
      case "Mezzo-soprano":
          sign = "C";
          line = "2";
        break;
      case "Baritone-C":
          sign = "C";
          line = "5";
        break;
      default:
        console.log("Error in translateClef. Unknown CLEF: " + clef);
    }
    res.sign = sign;
    res.line = line;

    return res;
  };
  this.translateTimeSignature = (timeSignature) => {
    var splitted = timeSignature.split("/");

    var res = {
      beats: splitted[0],
      beatType: splitted[1]
    }
    return res;
  };
  this.translateKeySignature = (keySignature) => {
    var fifths = null;
    var mode = null;

    switch(keySignature) {
      case "C":
        fifths = "0";
        mode = "major";
        break;
      case "G":
        fifths = "1";
        mode = "major";
        break;
      case "D":
        fifths = "2";
        mode = "major";
        break;
      case "A":
        fifths = "3";
        mode = "major";
        break;
      case "E":
        fifths = "4";
        mode = "major";
        break;
      case "B":
        fifths = "5";
        mode = "major";
        break;
      case "F#":
        fifths = "6";
        mode = "major";
        break;
      case "C#":
        fifths = "7";
        mode = "major";
        break;
      case "F":
        fifths = "-1";
        mode = "major";
        break;
      case "Bb":
        fifths = "-2";
        mode = "major";
        break;
        
      case "Eb":
        fifths = "-3";
        mode = "major";
        break;
      case "Ab":
        fifths = "-4";
        mode = "major";
        break;
      case "Db":
        fifths = "-5";
        mode = "major";
        break;
      case "Gb":
        fifths = "-6";
        mode = "major";
        break;
      case "Cb":
        fifths = "-7";
        mode = "major";
        break;
      case "a":
        fifths = "0";
        mode = "minor";
        break;
      case "e":
        fifths = "1";
        mode = "minor";
        break;
      case "b":
        fifths = "2";
        mode = "minor";
        break;
      case "f#":
        fifths = "3";
        mode = "minor";
        break;
      case "c#":
        fifths = "4";
        mode = "minor";
        break;
      case "g#":
        fifths = "5";
        mode = "minor";
        break;
      case "d#":
        fifths = "6";
        mode = "minor";
        break;
      case "a#":
        fifths = "7";
        mode = "minor";
        break;
      case "d":
        fifths = "-1";
        mode = "minor";
        break;
      case "g":
        fifths = "-2";
        mode = "minor";
        break;
      case "c":
        fifths = "-3";
        mode = "minor";
        break;
      case "f":
        fifths = "-4";
        mode = "minor";
        break;
      case "bb":
        fifths = "-5";
        mode = "minor";
        break;
      case "eb":
        fifths = "-6";
        mode = "minor";
        break;
      case "ab":
        fifths = "-7";
        mode = "minor";
        break;
      default:
        console.log("Error in translateKeySignature. Unknown KEYSIGNATURE: " + keySignature);
        break;
    }

    var res = {
      fifths: fifths,
      mode: mode,
    }

    return res;
  };
  this.translateAccidental = (accidental) => {
    var res = {
      accidental: accidental.toLowerCase()
    }
    return res;
  }
}

//Class XMLParser
function XMLParser() {
  //Initializing VexFlow
    VF = Vex.Flow;
    var div = document.getElementById("score");
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(SVG_WITDH, SVG_HEIGHT);
    this.contextVF = renderer.getContext();
    this.groupMeasures = this.contextVF.openGroup();
  
    this.xml = new XMLManager();
    this.xml2vf = new MusicXMLToVexFlow();
    this.attributes = new Attributes();
    this.tieGenerator = new TieGenerator();
    this.measures = null;
    this.infoElementClicked = null;

    this.loadXML = () => {
      this.xml.fetchXML();
      this.measures = this.xml.getMeasures();
    }
    this.getMeasures = () => this.measures;
    this.getAttributes = () => this.attributes;
  
    this.loadAttributes = (children) => {
      this.attributes.setData(getTagFromChildren("attributes", children));
      this.attributes.loadData();
    };
    this.loadNotes = (children) => {
    
      let notes = [];
      let arrayNotes = getTagFromChildren("note", children); 
      
      if( !(Array.isArray(arrayNotes)) ) {
        notes[0] = new Note(arrayNotes);
        notes[0].loadData(); 
      } else {
        for(let i = 0; i < arrayNotes.length; i++) {    
          notes[i] = new Note(arrayNotes[i]);                
          notes[i].loadData();    
        }
      }
    
      return notes;
    };
    this.loadNotesToVF = (notes, divisions, clefVF) => {
      let notesVF = [];
      let tiesVF = [];
    
      for(let i = 0; i < notes.length; i ++) {    //for each note
        let keyVF = [];
        let durationVF = null;
        let accidentalVF = null;
        let hasAccidental = false;      
    
        if(notes[i].getAccidental() != null) {
          accidentalVF = this.xml2vf.translateAccidental(notes[i].getAccidental());
          hasAccidental = true;
        }
        
        if(this.xml2vf.translateType(notes[i].getType()) != TYPE_TAG_UNKNOWN) {    //In case note has a duration  modifier (dot for example)
          durationVF = this.xml2vf.translateType(notes[i].getType());
        } else {
          durationVF = this.xml2vf.translateDuration(divisions, notes[i].getDuration());
        }
        
        if(notes[i].getIsRest()) {
          keyVF.push("b/4");        //specifies the vertical position of the rest
          durationVF += "r";   //specifies that the element it's a rest, and not a note
        } else {
          keyVF.push(this.xml2vf.translateKey(notes[i].getStep(), notes[i].getOctave(), accidentalVF));
        } 
    
        let staveNote = new VF.StaveNote({
          clef: clefVF,
          keys: keyVF,
          duration: durationVF
        });
    
        if(hasAccidental) {
          staveNote.addAccidental(0, new VF.Accidental(accidentalVF));
        }
        if(notes[i].getHasDot()) {
          staveNote.addDot(0);
        }
    
        if(notes[i].getTie() == "start") {
          this.tieGenerator.setStart(staveNote);
        }
        if(notes[i].getTie() == "stop") {      
          this.tieGenerator.setEnd(staveNote);
          tiesVF.push(this.tieGenerator.createTie());
        }    
        notesVF.push(staveNote);
      }
    
      return {
        notesVF: notesVF,
        tiesVF: tiesVF,
      }
    };
    this.showMeasures = (measures, indexMeasure) => {
      var children = null;
      var clefVF = null;
      var timeSignatureVF = null;
      var keySignatureVF = null;
      var oldMeasureVF = null;
      var measureVF = null;
      var tiesVF = null;
      var oneMoreTime = 0;
      
      for(let i = indexMeasure; i < indexMeasure + N_MEASURES + oneMoreTime; i++) {    //for each measure
        var notesVF = [];
        var beamsVF = null;             
        
        if(measures[i] != undefined) {    
          children = measures[i].children;
    
          if(getTagFromChildren("attributes",children) != TAG_NOT_FOUND) {
            this.loadAttributes(children);       //Loads attributes or updates them if they are already initialized
          }
        
          clefVF = this.xml2vf.translateClef(this.attributes.getSign(), this.attributes.getLine());
          timeSignatureVF = this.xml2vf.translateTimeSignature(this.attributes.getBeats(), this.attributes.getBeatType());
          keySignatureVF = this.xml2vf.translateKeySignature(this.attributes.getFifths(), this.attributes.getMode());    
          
          infoVF = this.loadNotesToVF(this.loadNotes(children), this.attributes.getDivisions(), clefVF);
          notesVF = infoVF.notesVF;
          tiesVF = infoVF.tiesVF;   
          beamsVF = VF.Beam.generateBeams(notesVF);
        }
    
        
        if(measureVF == null) {
          measureVF = new VF.Stave(SVG_MARGIN_LEFT, MEASURE_HEIGHT, MEASURE_WIDTH);
          oldMeasureVF = measureVF;
    
          if(clefVF != null && timeSignatureVF != null && keySignatureVF != null)  {    
            measureVF
            .addClef(clefVF)            
            .addTimeSignature(timeSignatureVF)
            .addModifier(new Vex.Flow.KeySignature(keySignatureVF));
          }
    
        } else {
          measureVF = new VF.Stave(oldMeasureVF.width + oldMeasureVF.x, MEASURE_HEIGHT, MEASURE_WIDTH);
          oldMeasureVF = measureVF;
        }
    
        //Draw measure
        measureVF
        .setContext(this.contextVF)
        .draw();
    
        if(notesVF.length != 0) {
          //Draw
          VF.Formatter.FormatAndDraw(this.contextVF, measureVF, notesVF);
          beamsVF.forEach(beam => { beam.setContext(this.contextVF).draw() });
          tiesVF.forEach(tie => { tie.setContext(this.contextVF).draw() });
    
    
          for( let j = 0; j < notesVF.length; j++) {
            elementInMeasure = notesVF[j].attrs.el;
            elementInMeasure.setAttribute("measure", i);
            elementInMeasure.setAttribute("note", j);
            elementInMeasure.addEventListener("click", (elementClicked) => {
              let element = elementClicked.path[3];
              let attrElement = element.attributes;
              let info = "";
    
              for(let i = 0; i < attrElement.length; i++) {
                if(attrElement[i].name == "measure") { info += attrElement[i].nodeValue + ", "; }
                if(attrElement[i].name == "note") { info += attrElement[i].nodeValue; }
              }  
              console.log("HOLA");    
              this.infoElementClicked = info;      
              document.getElementById("nav-bar").setAttribute("infoElementClicked", info);
            });
          }
        }
        if(i == (indexMeasure + N_MEASURES) - 1){   //Last iteration      
          if(!this.tieGenerator.getFinished()) {
            oneMoreTime = 1;
          }
        }
      }
    
      this.contextVF.closeGroup();
    };

    this.loadInfoForVexFlow = (indexMeasure, deleteContext) => {
      this.measures
      .then(measures => {

        if(indexMeasure < 0) {indexMeasure = 0}

        if( (indexMeasure + 1) > measures.length) {
          alert("There are no more measures");
          document.getElementById("buttonNext").disabled = true;
        }
        else {
          document.getElementById("buttonNext").disabled = false;
        }

        if(indexMeasure == 0) {
          document.getElementById("buttonPrevious").disabled = true;
        }
        else {
          document.getElementById("buttonPrevious").disabled = false;
        }

        if(deleteContext) {
          this.contextVF.svg.removeChild(this.groupMeasures);
          this.groupMeasures = this.contextVF.openGroup();
        }    
        this.showMeasures(measures, indexMeasure);
      });
    };

    this.changeAttribute = (attribute) => {

      this.measures.then( (measures) => {  
        var index = 0;
        var keys = Object.keys(attribute);

        if(keys[1] == "beatType"){ keys[1] = "beat-type";}

        for ( const key in attribute) {
          if (attribute.hasOwnProperty(key)) {              
            element = measures[0].getElementsByTagName(keys[index]);
            element[0].innerHTML = attribute[key];
            index++;
          }
        }
      });
    };
    this.changeNote = (modification, nMeasure, nNote) => {
      nNote = parseInt(nNote);

      this.measures.then(measures => {
        var index = 0;
        var keys = Object.keys(modification);
        var notes = measures[nMeasure].getElementsByTagName("note");

        for ( const key in modification) {
          if (modification.hasOwnProperty(key)) {            
            
            element = notes[nNote].getElementsByTagName(keys[index]);

            if(element.length < 1) {  //Tag didn't exist
              var newElement = document.createElement(keys[index]);
              newElement.innerHTML = modification[key];
              notes[nNote].appendChild(newElement);
            } 
            else {
            element[0].innerHTML = modification[key];
            }
            index++;
          }
        }
      });
    };

}

//img paths
var imgNotas = [
  "../img/editor/redonda.png",
  "../img/editor/blanca.png",
  "../img/editor/negra.png",
  "../img/editor/corchea.png",
  "../img/editor/semicorchea.png",
  "../img/editor/fusa.png",
  "../img/editor/semifusa.png",
];
var imgRest = [
  "../img/editor/sRedonda.png",
  "../img/editor/sBlanca.png",
  "../img/editor/sNegra.png",
  "../img/editor/sCorchea.png",
  "../img/editor/sSemicorchea.png",
  "../img/editor/sFusa.png",
"../img/editor/sSemifusa.png",
];
var imgAccidentals = [
  "../img/editor/sostenido.png",
  "../img/editor/bemol.png",
  "../img/editor/becuadro.png"
];
var imgProlongations = [
  "../img/editor/ligadura.png",
  "../img/editor/puntillo.png",
  "../img/editor/calderon.png",
];
var imgMeasure = [
  "../img/editor/clef.png",
  "../img/editor/timeSignature.png",
  "../img/editor/armadura.png",
];


//Components
Vue.component("nav-bar", {
  data: function() {
    return {
      displayOptions: {notes: true, duration: false, measure: false},


      optionNotes: {
        solmization: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
        alphabetic: ["C", "D", "E", "F", "G", "A", "B"],
      },
      optionDuration: {
        solmization: ["Redonda", "Blanca", "Negra", "Corchea", "Semmicorchea", "Fusa", "Semifusa"],
        alphabetic: ["Whole", "Half", "Quarter", "Eigth", "Sixteenth", "Thirty-second", "Sixty-fourth"],
      },
      optionRest: {
        solmization: ["Silencio de redonda", "Silencio de blanca", "Silencio de negra", "Silencio de corchea", "Silencio de semmicorchea", "Silencio de fusa", "Silencio de semifusa"],
        alphabetic: ["Whole rest", "Half rest", "Quarter rest", "Eigth rest", "Sixteenth rest", "Thirty-second rest", "Sixty-fourth rest"],
      },
      optionProlongation: {
        solmization: ["Ligadura", "Puntillo", "Calderón"],
        alphabetic: ["Tie", "Dotted", "Fermata"],
      },
      optionAccidental: {
        solmization: ["Sostenido", "Bemol", "Becuadro"],
        alphabetic: ["Sharp", "Flat", "Natural"],
      },
      optionClef: {
        solmization: ["Sol en 2.ª", "Fa en 4.ª", "Fa en 3.ª", "Do en 3.ª", "Do en 4.ª", "Do en 1.ª", "Do en 2.ª", "Do en 5.ª"],
        alphabetic: ["Treble", "Bass", "Baritone-F", "Alto", "Tenor", "Soprano", "Mezzo-soprano", "Baritone-C"]
      },
      optionKeySignature: {
        solmization: ["Do Mayor", "Sol Mayor", "Re Mayor", "La Mayor", "Mi Mayor", "Si Mayor", "Fa# Mayor", "Do# Mayor", "Fa Mayor", "Sib Mayor", "Mib Mayor", "Lab Mayor", "Reb Mayor", "Solb Mayor", "Dob Mayor", "La Menor", "Mi Menor", "Si Menor", "Fa# Menor", "Do# Menor", "Sol# Menor", "Re# Menor", "La# Menor", "Re Menor", "Sol Menor", "Do Menor", "Fa Menor", "Sib Menor", "Mib Menor", "Lab Menor"],
        alphabetic: [" C ", "G", "D", "A", "E", "B", "F#", "C#", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "a", "e", "b", "f#", "c#", "g#", "d#", "a#", "d", "g", "c", "f", "bb", "eb", "ab"]
      },
      musicalNotation: "solmization",

      octave: null,

      clef: null,
      timeSignature: null,
      keySignature: null,
    }
  },
  props: ["pImgNotas", "pImgRest",  "pImgAccidentals", "pImgProlongation", "pImgMeasure"],
  watch: {
    clef: function() {
      this.$emit("change-clef", this.clef);
    },
    timeSignature: function() {
      this.$emit("change-time-signature", this.timeSignature);
    },
    keySignature: function() {
      this.$emit("change-key-signature", this.keySignature);
    }
  },
  methods: {
    resetDisplayOptions: function() {
      for (const key in this.displayOptions) {
        if (this.displayOptions.hasOwnProperty(key)) {
          this.displayOptions[key] = false;
        }
      }
    },
    displayOption: function(option) {      
      this.resetDisplayOptions();
      this.displayOptions[option] = true;      
    },
    changeMusicalNotation: function() {
      document.getElementById("arrowNotation").className = "arrowRotate";
      
      setTimeout( () => {
        document.getElementById("arrowNotation").className = "arrow";
      }, 1100);

      if(this.musicalNotation == "solmization") { this.musicalNotation = "alphabetic"; }
      else { this.musicalNotation = "solmization"; }      
    },
    noteClicked: function(note) {
      if(this.octave != null) {
        newNote = {
          step: note,
          octave: this.octave
        }
        this.$emit("change-note", newNote);
      }
    },
    accidentalClicked: function(accidental) {     
      this.$emit("change-accidental", accidental);
    },
    durationClicked: function(duration) {
      //TODO
      console.log(duration);
    },
    restClicked: function(rest) {      
      //TODO
      console.log(rest);
    },
    prolongationClicked: function(prolongation) {
      //TODO
      console.log(prolongation);
    },
  },
  template:
  `<div id="nav-bar" ref="navBar">
    <div id="nav-bar-menu">
      <button v-on:click="displayOption('notes')">Notas</button>
      <button v-on:click="displayOption('duration')">Duración</button>
      <button v-on:click="displayOption('measure')">Compás</button>
    </div>

    <div id="nav-bar-options">
      <button title="Cambiar Not. Musical" v-on:click=changeMusicalNotation()><div id="arrowNotation" class="arrow">&#8635;</div></button>
      <div class="divider"></div>
      <div class="container" id="nav-bar-options-notes" v-if="displayOptions['notes']">
        <button v-for="(note, i) in optionNotes[musicalNotation]" v-on:click="noteClicked(optionNotes['alphabetic'][i])">{{note}}</button>
        <div class="dividerBlurred"></div>
        <label id="labelOctave" title="[0-9]" for="selectOctave">Octave:</label>
        <input type="number" id="selectOctave" v-model="octave" min="0" max="9">
        <div class="divider"></div>
        <button v-for="(accidental, i) in optionAccidental[musicalNotation]" v-bind:title="accidental" v-on:click="accidentalClicked(optionAccidental['alphabetic'][i])"><img v-bind:src="pImgAccidentals[i]"></button>
      </div>

      <div class="container" id="nav-bar-options-duration" v-if="displayOptions['duration']">
        <button v-for="(duration, i) in optionDuration[musicalNotation]" v-bind:title="duration" v-on:click="durationClicked(optionDuration['alphabetic'][i])"><img v-bind:src="pImgNotas[i]"></button>
        <div class="divider"></div>
        <button v-for="(rest, i) in optionRest[musicalNotation]" v-bind:title="rest" v-on:click="restClicked(optionRest['alphabetic'][i])"><img v-bind:src="pImgRest[i]"></button>
        
        <div class="divider"></div>
        <div id="prolongation">
          <button v-for="(prolongation, i) in optionProlongation[musicalNotation]" v-bind:title="prolongation" v-on:click="prolongationClicked(optionProlongation['alphabetic'][i])"><img v-bind:src="pImgProlongation[i]"></button>
        </div>

      </div>

      <div class="container" id="nav-bar-options-measure" v-if="displayOptions['measure']">
        <label for="selectClef"><img v-bind:src="pImgMeasure[0]"></label>
        <select v-model="clef" id="selectClef">
          <option v-for="(clef, i) in optionClef[musicalNotation]" v-bind:value="optionClef['alphabetic'][i]">{{clef}}</option>
        </select>
        <div class="divider"></div>
        <label for="selectTimeSignature"><img v-bind:src="pImgMeasure[1]"></label>
        <select v-model="timeSignature" id="selectTimeSignature">
          <option value="2/4">2/4</option>
          <option value="3/4">3/4</option>
          <option value="4/4">4/4</option>
          <option value="2/2">2/2</option>
          <option value="6/8">6/8</option>
        </select>
        <div class="divider"></div>
        <label for="selectKeysignature"><img v-bind:src="pImgMeasure[2]"></label>
        <select v-model="keySignature" id="selectKeysignature">
          <option v-for="(key, i) in optionKeySignature[musicalNotation]" v-bind:value="optionKeySignature['alphabetic'][i]">{{key}}</option>
        </select>

 
      </div>

    </div>
  </div>`

});
Vue.component("img-score", {
    data: function() {
      return {
        images: [],
        indexImages: 0,
        actualImage: null,

        deactivatePrevious: true,
        deactivateNext: false,
      }
    },
    created: function() {        
        fetch('/images')
            .then(response => response.text())
            .then(text => {
                let fileNames = text.split(',');
                fileNames.forEach(fileName => this.images.push(fileName));
            });         
    },
    methods: {
        incrementIndex: function() {            
            if(this.indexImages < this.images.length) {
                this.indexImages++;
            } else {
                this.indexImages = 0;
            }
        },
        decrementIndex: function() {
            if(this.indexImages > 0) {
                this.indexImages--;
            } else {
                this.indexImages = this.images.length - 1 ;                
            }
        },

    },
    watch:{
        indexImages: function() {
            this.actualImage = this.images[this.indexImages];

            if(this.indexImages == 0) {
                this.deactivatePrevious = true;
            } else {
                this.deactivatePrevious = false;
            }

            if(this.indexImages == this.images.length - 1) {
                this.deactivateNext = true;
            } else {
                this.deactivateNext = false;
            }
        },
        images: function() {
            this.actualImage = this.images[0];
        }
    },
    template:
    `<div id="img-score">
        <button class="back" v-on:click="decrementIndex()" v-bind:disabled="deactivatePrevious">&#8249;</button>
        <input type="checkbox" id="zoomCheck">
        <label for="zoomCheck">
        <img v-bind:src="actualImage">
        </label>
        <button class="next" v-on:click="incrementIndex()" v-bind:disabled="deactivateNext">&#8250;</button>
    </div>`
});
Vue.component("score", {
  template:
  `<div id="score">
  </div>`
});
Vue.component("measure-navigator", {
  data: function() {
    return {
      indexMeasures: 0,
    }
  },
  methods: {
      loadPreviousGroup: function() {
          this.indexMeasures -= N_MEASURES;
          this.$emit("load-group-measures",this.indexMeasures);
      },
      loadNextGroup: function() {
          this.indexMeasures += N_MEASURES;
          this.$emit("load-group-measures",this.indexMeasures);      
      }
  },
  template:
  `<div id="measure-navigator">
      <div id="buttonsNavigator">
          <button id="buttonPrevious" v-on:click="loadPreviousGroup()"><span> PREVIOUS </span></button>
          <button id="buttonNext" v-on:click="loadNextGroup()"><span> NEXT </span></button>
      </div>
  </div>`
})


//Vue instance
new Vue({
  el: "#editor",
  data: {
    imgDuracion: imgNotas,
    imgRest: imgRest,
    imgAccidentals: imgAccidentals,
    imgProlongations: imgProlongations,
    imgMeasure: imgMeasure,

    xmlParser: null,
    measures: null,
    alphToMusicXML: null,
  },
  mounted: function() {
    this.alphToMusicXML = new AlphabeticToMusicXML();
    this.xmlParser = new XMLParser();
    this.xmlParser.loadXML();
    this.xmlParser.loadInfoForVexFlow(0, false);

    this.measures = this.xmlParser.getMeasures();
  },
  methods: {
    loadGroupMeasures: function(indexMeasure) {
      this.xmlParser.loadInfoForVexFlow(indexMeasure, true);
    },

    changeClef: function(clef) {
      var newClef = this.alphToMusicXML.translateClef(clef);
      this.xmlParser.changeAttribute(newClef);

      this.loadGroupMeasures(0);
    },
    changeTimeSignature: function(timeSignature) {
      var newTimeSignature = this.alphToMusicXML.translateTimeSignature(timeSignature);
      this.xmlParser.changeAttribute(newTimeSignature);

      
      this.loadGroupMeasures(0);
    },
    changeKeySignature: function(keySignature) {
      var newKeySignature = this.alphToMusicXML.translateKeySignature(keySignature);
      this.xmlParser.changeAttribute(newKeySignature);

      
      this.loadGroupMeasures(0);
    },

    changeAccidental: function(accidental) {      
      var infoNote = document.getElementById("nav-bar").getAttribute("infoelementclicked");
      
      infoNote = infoNote.split(",");
      var nMeasure = infoNote[0];
      var nNote = infoNote[1];
      
      var newAccident = this.alphToMusicXML.translateAccidental(accidental);
      this.xmlParser.changeNote(newAccident, nMeasure, nNote);


      var indexMeasure = nMeasure / N_MEASURES;
      indexMeasure = Math.floor(indexMeasure);
      this.loadGroupMeasures(indexMeasure * N_MEASURES);
    },
    changeNote: function(note) {      
      var infoNote = document.getElementById("nav-bar").getAttribute("infoelementclicked");
      
      infoNote = infoNote.split(",");
      var nMeasure = infoNote[0];
      var nNote = infoNote[1];
      
      this.xmlParser.changeNote(note, nMeasure, nNote);


      var indexMeasure = nMeasure / N_MEASURES;
      indexMeasure = Math.floor(indexMeasure);
      this.loadGroupMeasures(indexMeasure * N_MEASURES);
    }

  },
  watch: {

  },
  template:
  `<div id="main">
    <nav-bar 
      v-bind:pImgNotas="imgDuracion" 
      v-bind:pImgRest="imgRest"
      v-bind:pImgAccidentals="imgAccidentals"
      v-bind:pImgProlongation="imgProlongations"
      v-bind:pImgMeasure="imgMeasure"
      
      v-on:change-clef="changeClef($event)"
      v-on:change-time-signature="changeTimeSignature($event)"
      v-on:change-key-signature="changeKeySignature($event)"
      
      v-on:change-note="changeNote($event)"
      v-on:change-accidental="changeAccidental($event)">
    </nav-bar>

    <img-score></img-score>

    <score></score>

    <measure-navigator
      v-on:load-group-measures="loadGroupMeasures($event)">
    </measure-navigator>

  </div>`
});

