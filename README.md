node-morse-code
===============

A morse code input library for node.js. It's for tapping and timing instead of converting strings (if you want that, check out the `morse` module).

3.5 seconds of inactivity is a space, 10 seconds with no tapping means 'send'.


## Installation
```
npm install morse-code
```

## Usage

Example with arduino:
```js
var arduino = require('duino')
  , board = new arduino.Board()
  , Morse = require('./modules/morse');

var message = '';

var mainButton = new arduino.Button({
  board: board,
  pin: 2
});

var morse = new Morse();

mainButton.on('down', morse.down.bind(morse));
mainButton.on('up', morse.up.bind(morse));

morse.on('addCharacter', function(char) {
  message += char
  
  // update your live view of the message
  console.log('Message updated: ' + message);
});

morse.on('setPossibles', function(possibles) {
  // possibles = the possible characters that start with what's being tapped
  console.log('Matching chars: ' + possibles);
});

morse.on('send', function() {
  // The last char would have been a space
  message = message.slice(0, -1);
  
  console.log('Sent: ' + message);
  message = '';
});

```