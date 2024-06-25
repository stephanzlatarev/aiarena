
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
      let result = this.next & MASK[this.nextBits];
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
          this.next >>= bits;
          bits = 0;
        }
      }

      return result;
    } else {
      let byte = this.buffer.readUInt8(this.index++);
      const isNegative = (byte & 0x01);
      let result = (byte & 0x7F) >> 1;
      let bits = 6;

      while (byte & 0x80) {
        byte = this.buffer.readUInt8(this.index++);
        result |= (byte & 0x7F) << bits;
        bits += 7;
      }

      this.nextBits = 0;

      return isNegative ? -result : result;
    }
  }

  skip(bytes) {
    this.index += bytes;
    this.nextBits = 0;
  }

  seek(isMatching, length) {
    for (let bufferIndex = this.index; bufferIndex < this.buffer.length - length; bufferIndex++) {
      const data = [];

      for (let dataIndex = 0; dataIndex < length; dataIndex++) {
        data.push(this.buffer.readUInt8(bufferIndex + dataIndex));
      }

      if (isMatching(...data)) {
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
