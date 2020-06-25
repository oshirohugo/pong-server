
const TICK_RATE = parseInt(process.env.TICK_RATE || '60', 10); // updates per second
const LOOP_PERIOD = 1 / TICK_RATE;

setInterval(() => {
  const date = new Date();
  process.stdout.write(`${date.getTime()}\r`);
}, LOOP_PERIOD);
