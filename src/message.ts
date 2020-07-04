export type MessageType = 'START' | 'GAME_STATE' | 'CONTROL';

class Message {
  constructor(public type: MessageType, public body: any) {}

  static parse(rawMessage: string): Message {
    const message = JSON.parse(rawMessage);
    return new Message(message.type, message.body);
  }

  public toJSON(): any {
    return {
      type: this.type,
      body: this.body.toJSON(),
    };
  }

  public stringify(): string {
    return JSON.stringify(this);
  }
}

export default Message;
