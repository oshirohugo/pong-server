import Game from './game';
import WebsocketServer from './websocket-server';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  TICK_RATE,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_SPEED,
  BALL_SPEED_X,
  BALL_SPEED_Y,
  BALL_ACCELERATION,
  BALL_SZ,
} from './game-params';

const PORT = Number(process.env.PORT);

const game = new Game({
  updateRate: TICK_RATE,
  mapHeight: MAP_HEIGHT,
  mapWidth: MAP_WIDTH,
  playerHeight: PLAYER_HEIGHT,
  playerWidth: PLAYER_WIDTH,
  playerSpeed: PLAYER_SPEED,
  ballSpeedX: BALL_SPEED_X,
  ballSpeedY: BALL_SPEED_Y,
  ballAcceleration: BALL_ACCELERATION,
  ballSz: BALL_SZ,
});

const webSocketServer = new WebsocketServer(PORT, {
  onMessage: game.onMessage.bind(game),
  onClose: game.onClose.bind(game),
  onConnection: game.onConnection.bind(game),
});

game.setOnTick(webSocketServer.broadcast.bind(webSocketServer));
game.start();

console.log(`server start: ws://0.0.0.0:${PORT}`);
