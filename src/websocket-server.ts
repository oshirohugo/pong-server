import WebSocket from 'ws';

type WebsocketServerCb = {
  onMessage: (msg: string) => void;
  onClose: (msg: WebSocket) => void;
  onConnection: (ws: WebSocket) => void;
};

class WebsocketServer {
  private wss: WebSocket.Server;
  private cb: WebsocketServerCb;

  constructor(port: number, cb: WebsocketServerCb) {
    this.wss = new WebSocket.Server({ port });
    this.cb = cb;

    this.wss.on('connection', (ws) => {
      ws.onmessage = (ev) => this.cb.onMessage(ev.data.toString());
      ws.onclose = (ev) => this.cb.onClose(ev.target);
      this.cb.onConnection(ws);
    });
  }

  public broadcast(msg: string): void {
    this.wss.clients.forEach((client) => client.send(msg));
  }
}

export default WebsocketServer;
