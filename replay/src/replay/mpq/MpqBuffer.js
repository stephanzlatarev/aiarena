
const MASK = [0x00, 0x01, 0x03, 0x07, 0x0F, 0x1F, 0x3F, 0x7F, 0xFF];

export default class MpqBuffer {

  constructor(buffer) {
    this.buffer = buffer;
    this.index = 0;

    this.next = null;
    this.nextBits = 0;
  }

  done() {
    return (this.nextBits === 0) && (this.index >= this.buffer.length);
  }

  read() {
    const type = this.readBits(8);

    switch (type) {
      case 0: {
        const array = [];
        const size = this.readInt();

        for (let i = 0; i < size; i++) {
          const value = this.read();

          array.push(value);
        }

        return array;
      }
      case 2: return this.readBlob(this.readInt());
      case 4: return this.readBits(8) ? this.read() : null;
      case 5: {
        const map = {};
        const size = this.readInt();

        for (let i = 0; i < size; i++) {
          const key = this.readInt();
          const value = this.read();

          map[key] = value;
        }

        return map;
      }
      case 9: return this.readInt();
    }
  }

  readBlob(length) {
    const start = this.buffer.byteOffset + this.index;

    this.index += length;
    this.nextBits = 0;

    return Buffer.from(this.buffer.buffer, start, length);
  }

  readBits(bits) {
    let result = 0;
    let resultBits = 0;

    while (resultBits != bits) {
      if (this.nextBits === 0) {
        if (this.done()) return 0;

        this.next = this.buffer.readUInt8(this.index++);
        this.nextBits = 8;
      }

      let copyBits = Math.min(bits - resultBits, this.nextBits);
      let copy = (this.next & ((1 << copyBits) - 1));

      result |= copy << (bits - resultBits - copyBits);

      this.next >>>= copyBits;
      this.nextBits -= copyBits;

      resultBits += copyBits;
    }

    return result;
  }

  readInt(bytes) {
    if (bytes) {
      let result = this.next >> this.nextBits;
      let bits = bytes - this.nextBits;

      while (bits > 0) {
        this.next = this.buffer.readUInt8(this.index++);

        if (bits >= 8) {
          result <<= 8;
          result |= this.next;
          bits -= 8;
        } else {
          result <<= bits;
          result |= (this.next & MASK[bits]);
          bits = 0;
          this.next >>= (8 - this.nextBits);
        }
      }

      return result;
    } else {
      // Reads a signed integer of variable length
      // Code from https://github.com/ascendedguard/sc2replay-csharp
      let l2 = 0;
      for (let k = 0;; k += 7) {
        let l1 = this.readBits(8);
        l2 = (l2 | (l1 & 0x7F) << k) >>> 0;
        if ((l1 & 0x80) === 0) {
          return ((l2 & 1) >>> 0 > 0 ? -(l2 >>> 1) : l2 >>> 1);
        }
      }
    }
  }

  skip(bytes) {
    this.index += bytes;
    this.nextBits = 0;
  }

  seek(data) {
    for (let bufferIndex = this.index; bufferIndex < this.buffer.length; bufferIndex++) {
      let isMatching = true;

      for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
        const byte = this.buffer.readUInt8(bufferIndex + dataIndex);

        if (byte !== data[dataIndex]) {
          isMatching = false;
          break;
        }
      }

      if (isMatching) {
        this.index = bufferIndex;
        return true;
      }
    }

    return false;
  }

  toString(encoding, start, end) {
    return this.buffer.toString(encoding, start, end);
  }

}
