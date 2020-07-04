import WebSocket from 'ws';

import Message from './message';
import Game from './game-state';
import { Input } from './types';

const TICK_RATE = Number(process.env.TICK_RATE); // updates per second
const LOOP_PERIOD = (1 / TICK_RATE) * 1000;
const PORT = Number(process.env.PORT);
const MAX_PLAYERS = Number(process.env.NAX_PLAYERS);

export const MAP_WIDTH = Number(process.env.MAP_WIDTH);
export const MAP_HEIGHT = Number(process.env.MAP_HEIGHT);
const SPEED = Number(process.env.SPEED);

const gameState = new Game(SPEED, TICK_RATE);
const msgQueue: Message[] = [];

const wss = new WebSocket.Server({
  port: PORT,
});

wss.on('connection', (ws) => {
  if (gameState.nextId > MAX_PLAYERS - 1) return;

  ws.onmessage = (ev) => {
    const msg = Message.parse(ev.data.toString());
    msgQueue.push(msg);
  };

  ws.onclose = () => {
    const player = gameState.playersConnections.get(ws);
    if (player) {
      gameState.players[player.id] = undefined;
      gameState.nextId = player?.id;
    }
    gameState.playersConnections.delete(ws);
  };
  const newPlayer = gameState.createNewPlayer();
  gameState.playersConnections.set(ws, newPlayer);

  const startMsg = new Message('START', gameState);

  ws.send(startMsg.stringify());

  console.log(startMsg.stringify());
});

let lastUpdate = new Date().getTime();
let elapsed;
let currentUpdate;

setInterval(() => {
  let j = 0;
  while (j < msgQueue.length) {
    const msg = msgQueue[j];
    const { playerId, pressTime, sequenceNumber } = msg.body as Input;
    const currentPlayer = gameState.players[playerId];
    if (currentPlayer) {
      currentPlayer.applyInput(pressTime);
      currentPlayer.lastProcessedInput = sequenceNumber;
    }
    msgQueue.splice(j, 1);
    j++;
  }

  currentUpdate = new Date().getTime();
  elapsed = (currentUpdate - lastUpdate) / 1000;
  lastUpdate = currentUpdate;

  if (gameState.playersConnections.size >= 2) {
    gameState.ball.updatePosition(elapsed, gameState.players);
  }

  gameState.clearDirection();

  const gameStateMsg = new Message('GAME_STATE', gameState);
  // console.log(gameStateMsg.stringify());
  wss.clients.forEach((client) => client.send(gameStateMsg.stringify()));
}, LOOP_PERIOD);

console.log(`server start: ws://0.0.0.0:${PORT}`);
