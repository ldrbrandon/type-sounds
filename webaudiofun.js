function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            }    
        );
    }
    request.onerror = function() {
        alert('BufferLoader: XHR error');        
    }
    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}


// window.onload = init;
var context;
// var bufferLoader;

function init() {
  // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    // BufferLoader takes: (context, url, callback)
    // bufferLoader = new BufferLoader(
    //   context,
    //   [
    //     'http://localhost:8085/atari_sound.mp3',
    //     'http://localhost:8085/mario_walk.wav',
    //     'http://localhost:8085/bomb.mp3'
    //   ],
    //   finishedLoading
    //   );

    // bufferLoader.load();
}

// When you drag the drag me div to a drop area it triggers the
// bomb explosion sound

// function finishedLoading(bufferList) {
//   atari_sound = bufferList[0];
//   mario_sound = bufferList[1];

//   bindSoundsToButtons(atari_sound, mario_sound);
// }

function playSound(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

// function bindSoundsToButtons(sound1, sound2) {
//   $("#atari").on('click', function() {
//     console.log("ATARI");
//     playSound(sound1)
//   })
//   $("#mario").on('click', function() {
//     console.log("MARIO");
//     playSound(sound2)
//   })
// }

//Root frequencies
var c1 = 65.41;
var d1 = 73.424;
var e1 = 82.41;
var f1 = 87.31;
var g1 = 98;
var a1 = 110;
var b1 = 123.48;

var OscillatorClass = {
  playOsc: function(frequency) {
    var oscillator, gainNode;
    oscillator = context.createOscillator();
    var currTime = context.currentTime;
    oscillator.type = 3;
    oscillator.frequency.value = frequency;

    gainNode = context.createGainNode();
    oscillator.connect(gainNode);
    oscillator.start(0);
    OscillatorClass.fadeInAndFadeOutOsc(oscillator, gainNode, currTime, 0.1, 0.1);
  },

  buildChord: function(chordNum, root, two, three) {
    switch (chordNum) {
      case '1':
        console.log("Building chord...");
        root.frequency.value = (c1);
        two.frequency.value = (e1); 
        three.frequency.value = (g1);
        return;
      default: 
        break;
    }
  },

  playChord: function(chordNum){
    var gainNode = context.createGainNode();
    var root = context.createOscillator();
    var two = context.createOscillator();
    var three = context.createOscillator();
    var currTime = context.currentTime;
    root.type = 3;
    two.type = 3;
    three.type = 3;
    // After the oscillators are initialized, build the chord
    OscillatorClass.buildChord(chordNum, root, two, three);
    // connect the chord's notes to the gainNode
    root.connect(gainNode);
    two.connect(gainNode);
    three.connect(gainNode);
    // start the notes
    root.start(0);
    two.start(0);
    three.start(0);
    OscillatorClass.fadeInAndFadeOutChord(root, two, three, gainNode, 1.5, 0.25)
  },

  fadeInAndFadeOutOsc: function(oscillator, gainNode, currTime, duration, fade) {
    // Connect the gain node up to the speakers
    gainNode.connect(context.destination);
    // fade the sound in
    gainNode.gain.linearRampToValueAtTime(0, currTime)
    gainNode.gain.linearRampToValueAtTime(1, currTime+fade)
    window.setTimeout(function(){
      gainNode.gain.linearRampToValueAtTime(1, context.currentTime+duration-fade)
      gainNode.gain.linearRampToValueAtTime(0, context.currentTime+duration)
      console.log("Disconnecting");
      oscillator.disconnect();}, 1000);
  },

  fadeInAndFadeOutChord: function(root, two, three, gainNode, currTime, duration, fade) {
    // Connect the gain node up to the speakers
    gainNode.connect(context.destination);
    // fade the sound in
    gainNode.gain.linearRampToValueAtTime(0, currTime)
    gainNode.gain.linearRampToValueAtTime(1, currTime+fade)
    window.setTimeout(function(){
      gainNode.gain.linearRampToValueAtTime(1, context.currentTime+duration-fade)
      gainNode.gain.linearRampToValueAtTime(0, context.currentTime+duration)
      console.log("Disconnecting");
      root.disconnect();
      two.disconnect();
      three.disconnect();}, 1300);
  }
}

var SoundComponents = {
  randomDetune: function() {
    var randomVal = Math.random()*10;
    var cents;
    if(randomVal > 4.5){
      cents = Math.random()*1.1;
      return cents
    } else {
      cents = (Math.random()*(-1.1));
      return cents
    }
  }
}

var KeyTracker = {
  handleKeyPressed: function(event) {
    // grab the letter you pressed
    var letter = String.fromCharCode(event.keyCode);
    // Print the letter they type to the screen
    console.log(letter+": "+event.keyCode);
    $('.typed').append(letter);
    var freq;
    switch (letter){
      case 'a':
        freq = (a1*2);
        console.log(freq);
        OscillatorClass.playOsc(freq); 
        break;
      case 'A':
        freq = (a1*2)*2;
        console.log(freq);
        OscillatorClass.playOsc(freq); 
        break;
      case 'b':
        freq = (b1*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'B':
        freq = (b1*2)*2;
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'c':
        freq = (c1*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'C':
        freq = ((c1*2)*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'd':
        freq = (d1*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'D':
        freq = ((d1*2)*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'e':
        freq = (e1*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'E':
        freq = ((e1*2)*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'f':
        freq = (f1*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'F':
        freq = ((f1*2)*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'g':
        freq = (g1*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case 'G':
        freq = ((g1*2)*2);
        console.log(freq);
        OscillatorClass.playOsc(freq);
        break;
      case '1': 
      OscillatorClass.playChord('1');
        break;
      default:
        break;
    }
  },

  listenToKeyPress: function() {
    var self = this;
    self.disableOtherUsesOfDeleteKey();
    document.addEventListener('keypress', function(event){
      self.handleKeyPressed(event);
    })
  },

  disableOtherUsesOfDeleteKey: function() {
    $(window).keydown(function(e){
      if(e.which === 8) {
        console.log("DELETE!");
        e.preventDefault();
        var typed = $('.typed').text().trim().split('');
        typed.pop();
        $('.typed').html(typed.join(''));
      }
    })
  }
}

var NoteBoxes = {
  findFreq: function(noteBox) {
    var freq = noteBox.textContent.match(/\d+.\d+/)[0];
    freq = Number(freq);
    return freq;
  }
}

$(document).ready(function(){
  init();
  // $(".explode-drag").draggable({revert: true});
  // $(".explode-drop").droppable({ tolerance: "touch", drop: function(event,ui){
  //     console.log("KABOOM!");
  //   }
  // });
  // alert("BLOWUP");
  $('.notes').on('click', function() {
    console.log("you clicked a note");
    var that = this;
    var freq = NoteBoxes.findFreq(that);
    console.log(freq);
    OscillatorClass.playOsc(freq);
  });

  KeyTracker.listenToKeyPress();
})