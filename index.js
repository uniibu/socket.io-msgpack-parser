const msgpack = require('@msgpack/msgpack');
const Emitter = require('component-emitter');
exports.protocol = 4;

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'ACK',
  'ERROR',
  'BINARY_EVENT',
  'BINARY_ACK'
];

exports.CONNECT = 0;
exports.DISCONNECT = 1;
exports.EVENT = 2;
exports.ACK = 3;
exports.ERROR = 4;
exports.BINARY_EVENT = 5;
exports.BINARY_ACK = 6;

const errorPacket = {
  type: exports.ERROR,
  data: 'parser error'
};

class Encoder {
  encode (packet, callback) {
    switch (packet.type) {
      case exports.CONNECT:
      case exports.DISCONNECT:
      case exports.ERROR:
        /* eslint-disable-next-line */
        return callback([JSON.stringify(packet)]);
      default:
        /* eslint-disable-next-line  */
        return callback([msgpack.encode(packet)]);
    }
  }
}

class Decoder extends Emitter {
  add (obj) {
    if (typeof obj === 'string') {
      this.parseJSON(obj);
    } else {
      this.parseBinary(obj);
    }
  }

  parseJSON (obj) {
    try {
      const decoded = JSON.parse(obj);
      this.emit('decoded', decoded);
    } catch (e) {
      this.emit('decoded', errorPacket);
    }
  }

  parseBinary (obj) {
    try {
      const decoded = msgpack.decode(obj);
      this.emit('decoded', decoded);
    } catch (e) {
      this.emit('decoded', errorPacket);
    }
  }

  destroy () { }
}

exports.Encoder = Encoder;
exports.Decoder = Decoder;
