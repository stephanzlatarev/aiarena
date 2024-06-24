
export default class MpqHash {

  static size = 16;

  constructor(buffer, offset) {
    if (buffer && (offset >= 0)) {
      this.name1 = buffer.readUInt32LE(offset);
      this.name2 = buffer.readUInt32LE(offset + 4);
      this.locale = buffer.readUInt32LE(offset + 8);
      this.blockIndex = buffer.readUInt32LE(offset + 12);
      this.key = MpqHash.key(this.name1, this.name2);
    }
  }

  static key(name1, name2) {
    return name1 + "-" + name2;
  }

}
