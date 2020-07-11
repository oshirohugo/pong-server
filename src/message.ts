export type MessageType = 'START' | 'GAME_STATE' | 'CONTROL';

class Message {
  constructor(public type: MessageType, public body: any) {}

  static parse(rawMessage: string) {
    const message = JSON.parse(rawMessage);
    return new Message(message.type, message.body);
  }

  public toJSON() {
    return {
      type: this.type,
      body: this.body.toJSON(),
    };
  }

  public stringify() {
    return JSON.stringify(this);
  }
}

export default Message;
