/* jslint node: true */
/* eslint-env node */
'use strict';

// Require express, socket.io, and vue
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let ip = require('ip');

// Pick arbitrary port for server
let port = 3000;
app.set('port', (process.env.PORT || port));

// Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public/')));
// Serve vue from node_modules as vue/
app.use('/vue', express.static(path.join(__dirname, '/node_modules/vue/dist/')));
// Serve index.html directly as root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});
app.get('/mover', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/mover.html'));
});

io.on('connection', (socket) => {
  /********************
  HERE YOU CAN ADD COMMAND MESSAGES.
  These are not associated with any logical operations
  *********************/
  socket.on('move:eyes', (eyes) => {
    io.emit('move:eyes', eyes);
  });
  socket.on('move:motors', (motors) => {
    io.emit('move:motors', motors);
  });
  socket.on('move:servo', (motors) => {
    io.emit('move:servo', motors);
  });
  // For now, this is just to confirm...
  socket.on('moved:motors', (motors) => {
    io.emit('moved:motors', motors);
  });
  socket.on('moved:servo', () => {
    io.emit('moved:servo');
  });
});

http.listen(app.get('port'), () => {
  console.log('Server listening on localhost:' + app.get('port') + ' and http://' + ip.address() + ':' + app.get('port'));
});
