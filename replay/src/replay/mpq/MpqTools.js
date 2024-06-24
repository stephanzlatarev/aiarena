import seekBzip from "seek-bzip";

const stormBuffer = Buffer.alloc(0x500 * 4);

export default class MpqTools {

  static hashString(input, offset) {
    let seed1 = 0x7fed7fed;
    let seed2 = 0xeeeeeeee;
    input = input.toUpperCase();

    for (let i = 0; i < input.length; i++) {
        let val = input.charCodeAt(i);
        seed1 = stormBuffer.readUInt32LE((offset + val) * 4) ^ (seed1 + seed2);
        seed2 = val + seed1 + seed2 + (seed2 << 5) + 3;
    }

    return seed1 >>> 0;
  }

  static decryptTable(buffer, key) {
    let seed1 = MpqTools.hashString(key, 0x300);
    let seed2 = 0xeeeeeeee;

    for (let i = 0; i < buffer.length - 3; i += 4) {
      seed2 = (seed2 + stormBuffer.readUInt32LE((0x400 + (seed1 & 0xFF)) * 4)) >>> 0;

      let result = buffer.readUInt32LE(i);
      result = (result ^ (seed1 + seed2)) >>> 0;

      seed1 = ((((~seed1 << 21) + 0x11111111) >>> 0) | (seed1 >>> 11)) >>> 0;
      seed2 = (result + seed2 + (seed2 << 5) + 3) >>> 0;

      buffer.writeUInt32LE(result >>> 0, i);
    }

    return buffer;
  }

  static decompress(buffer, expectedLength) {
    let type = buffer.readUInt8(0);

    if (type === 0x10) {
      // BZip2
      const compressed = Buffer.from(buffer.buffer, buffer.offset + 1, buffer.length - 1);
      buffer = Buffer.alloc(expectedLength);
      seekBzip.decode(compressed, buffer);
    }

    return buffer;
  }
}

let seed = 0x100001;

for (let index1 = 0; index1 < 0x100; index1++) {
  let index2 = index1;

  for (let i = 0; i < 5; i++, index2 += 0x100) {
    seed = ((seed * 125 + 3) % 0x2aaaab) >>> 0;
    let temp = (seed & 0xffff) << 16;
    seed = ((seed * 125 + 3) % 0x2aaaab) >>> 0;
    stormBuffer.writeUInt32LE((temp | (seed & 0xffff)) >>> 0, index2 * 4);
  }
}
