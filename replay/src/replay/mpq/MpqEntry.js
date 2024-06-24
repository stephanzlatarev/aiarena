
const MpqFileFlags = {
  Compressed: 0x200,
  Encrypted:  0x10000,
  SingleUnit: 0x1000000,
  Exists:     0x80000000,
};

export default class MpqEntry {

  static size = 16;

  constructor(buffer, offset, headerOffset) {
    this.fileOffset = buffer.readUInt32LE(offset);
    this.filePos = this.fileOffset + headerOffset;
    this.compressedSize = buffer.readUInt32LE(offset + 4);
    this.fileSize = buffer.readUInt32LE(offset + 8);
    this.flags = buffer.readUInt32LE(offset + 12);
  }

  exists() {
    return this.flags !== 0;
  }

  isCompressed() {
    return (this.flags & MpqFileFlags.Compressed) !== 0;
  }

  isSingleUnit() {
    return (this.flags & MpqFileFlags.SingleUnit) !== 0;
  }

  toString() {
    return this.filename;
  }

}
