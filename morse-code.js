// based loosely on http://www.bennadel.com/blog/2267-Decoding-Morse-Code-With-JavaScript.htm

var EventEmitter = require('events').EventEmitter
  , util = require('util');


var Morse = function() {
  EventEmitter.call(this);

  var dotDuration = 250;
  var dashDuration = (dotDuration * 3);
  var pauseDuration = (dotDuration * 1);

  // The current sequence being evaluated
  var sequence = "";

  var keyDownDate = null;
  var resolveTimer = null;
  var spaceTimer = null;
  var sendTimer = null;


  // On key down. No return value
  this.down = function() {
    // We only want the first press event to be registered.
    if (keyDownDate) return;
    clearTimeout(resolveTimer);
    clearTimeout(spaceTimer);
    clearTimeout(sendTimer);
 
    keyDownDate = new Date();
  }

  // On key up, returns potential matches
  this.up = function() {
    var keyPressDuration = ((new Date())- keyDownDate);
    keyDownDate = null;
 
    if (keyPressDuration <= dotDuration){
      sequence += '.';
    } else {
      sequence += '-';    
    }

    // Wait to see if we need to resolve the current sequence
    var that = this;
    resolveTimer = setTimeout(function(){
      try {
        var character = resolveSequence();
        that.emit('addCharacter', character);
      } catch (e) {
        // Something went wrong
        sequence = '';
      }
      that.emit('setPossibles', []);

      spaceTimer = setTimeout(function(){
        that.emit('addCharacter', '_');
      }, 3500);
      sendTimer = setTimeout(function(){
        that.emit('send', null);
      }, 10000);

    }, (pauseDuration * 3));
  
    this.emit('setPossibles', resolvePartial());
  }


  this.clearTimers = function(reset) {
    sequence = "";
    clearTimeout(resolveTimer);
    clearTimeout(spaceTimer);
    clearTimeout(sendTimer);
  
    if (reset) {
      var that = this;
      spaceTimer = setTimeout(function(){
        that.emit('addCharacter', '_');
      }, 3500);
      sendTimer = setTimeout(function(){
        that.emit('send', null)
      }, 10000);
    }
  }

  var patternMap = {
    ".-": "A",
    "-...": "B",
    "-.-.": "C",
    "-..": "D",
    ".": "E",
    "..-.": "F",
    "--.": "G",
    "....": "H",
    "..": "I",
    ".---": "J",
    "-.-": "K",
    ".-..": "L",
    "--": "M",
    "-.": "N",
    "---": "O",
    ".--.": "P",
    "--.-": "Q",
    ".-.": "R",
    "...": "S",
    "-": "T",
    "..-": "U",
    "...-": "V",
    ".--": "W",
    "-..-": "X",
    "-.--": "Y",
    "--..": "Z",
    "-----": "0",
    ".----": "1",
    "..---": "2",
    "...--": "3",
    "....-": "4",
    ".....": "5",
    "-....": "6",
    "--...": "7",
    "---..": "8",
    "----.": "9",
    ".-.-.-": ".",
    "--..--": ",",
    "..--..": "?"
  };

  // The potential matches for the current sequence
  function resolvePartial() { 
    var potentialCharacters = [];
 
    for (var pattern in patternMap) {
      if (pattern.indexOf(sequence) === 0){
        potentialCharacters.push(patternMap[pattern]);
      }
    }
 
    return potentialCharacters.sort();
  };
 
  // Get the character of the current sequence, or raise an error
  function resolveSequence(){
    var character = patternMap[sequence];
    sequence = "";
  
    if (!character) throw new Error("InvalidSequence");
    return character;
  };
};

util.inherits(Morse, EventEmitter);
module.exports = Morse;