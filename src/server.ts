import Game from './game';
import WebsocketServer from './websocket-server';

const TICK_RATE = Number(process.env.TICK_RATE); // updates per second
const PORT = Number(process.env.PORT);

export const MAP_WIDTH = Number(process.env.MAP_WIDTH);
export const MAP_HEIGHT = Number(process.env.MAP_HEIGHT);

const game = new Game({
  updateRate: TICK_RATE,
  mapHeight: MAP_HEIGHT,
  mapWidth: MAP_WIDTH,
});

const webSocketServer = new WebsocketServer(PORT, {
  onMessage: game.onMessage.bind(game),
  onClose: game.onClose.bind(game),
  onConnection: game.onConnection.bind(game),
});

game.setOnTick(webSocketServer.broadcast.bind(webSocketServer));
game.start();

console.log(`server start: ws://0.0.0.0:${PORT}`);
