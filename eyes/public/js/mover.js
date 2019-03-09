/* jslint es5:true, indent: 2 */
/* global Vue, io */
/* exported vm */
'use strict';
const socket = io();

/* eslint-disable-next-line no-new */
new Vue({
  el: '#app',
  data: {
    eyePos: {},
    turned: '',
    mouseDown: false
  },
  created() {
    socket.on('moved:motors', (motors) => {
      const { left, right } = motors;
      const sign = `${+left}${+right}`;
      const signMap = new Map([
        ['10', 'LEFT'], // left && !right
        ['01', 'RIGHT'], // !left && right
        ['11', 'FORWARD'], // left && right
        ['00', 'BACKWARD'] // !left && !right
      ]);
      this.turned = signMap.get(sign);
    });
    socket.on('moved:servo', () => {
      this.turned = 'SERVO';
    });
  },
  methods: {
    pressed() {
      this.mouseDown = true;
    },
    released() {
      this.mouseDown = false;
    },
    moveEyes(event) {
      let offset = {
        x: event.currentTarget.getBoundingClientRect().left,
        y: event.currentTarget.getBoundingClientRect().top
      };
      if (this.mouseDown) {
        this.eyePos = {
          x: event.clientX - 10 - offset.x,
          y: event.clientY - 10 - offset.y
        };
        socket.emit('move:eyes', this.eyePos);
      }
    },
    turnLeft() {
      socket.emit('move:motors', { left: true, right: false });
    },
    turnRight() {
      socket.emit('move:motors', { left: false, right: true });
    },
    driveForward() {
      socket.emit('move:motors', { left: true, right: true });
    },
    driveBackward() {
      socket.emit('move:motors', { left: false, right: false });
    },
    driveServo() {
      socket.emit('move:servo');
    }
  }
});
