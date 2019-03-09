/* jslint es5:true, indent: 2 */
/* global Vue, io */
/* exported vm */
'use strict';
const socket = io();

const createBeep = function () {
  let frequency = 50;
  let period = 1 / frequency;
  let CtxClass = window.AudioContext;
  let ctx = new CtxClass();
  return function (times, finishedCallback) {
    if (typeof finishedCallback !== 'function') {
      finishedCallback = function () {};
    }
    let osc = ctx.createOscillator();
    let currentTime = ctx.currentTime;
    osc.type = 'square';
    osc.frequency.value = frequency;

    osc.connect(ctx.destination);
    osc.start(currentTime);
    osc.stop(currentTime + period * times);

    setTimeout(() => {
      finishedCallback();
    }, period * times);
  };
};
let beep;

/* eslint-disable-next-line no-new */
new Vue({
  el: '#dots',
  data: {
    eyePos: {}
  },
  methods: {
    resume() {
      let context = new window.AudioContext();
      context.resume().then(() => {
        console.log('Playback resumed successfully');
        beep = createBeep();
      });
    }
  },
  created() {
    /************
    HERE YOU CAN WRITE NEW LISTENERS IF YOU NEED
    ************/
    socket.on('move:eyes', (data) => {
      this.eyePos = data;
    });

    // The motor commands are transferred to the Arduino by sound pulses
    socket.on('move:motors', (motors) => {
      const { left, right } = motors;
      const sign = `${+left}${+right}`;
      const signMap = new Map([
        ['10', 1], // left && !right
        ['01', 2], // !left && right
        ['11', 3], // left && right
        ['00', 4] // !left && !right
      ]);
      const letTheMoverKnowItHasBeenDone = () => {
        socket.emit('moved:motors', motors);
      }
      beep && beep(signMap.get(sign), letTheMoverKnowItHasBeenDone);
    });

    socket.on('move:servo', () => {
      const letTheMoverKnowItHasBeenDone = () => {
        socket.emit('moved:servo');
      }
      beep && beep(5, letTheMoverKnowItHasBeenDone);
    });
  }
});
