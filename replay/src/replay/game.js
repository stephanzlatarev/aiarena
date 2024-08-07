import Event from "./event.js";
import createEvent from "./ability.js";

export default async function readGameEvents(events, replay, decoder) {
  try {
    const game = {
      loop: undefined,
      selection: [null, null],
    }

    while (decoder.seek(isSupportedEvent, 3)) {
      await readGameEvent(events, replay, game, decoder);
      decoder.skip(0);
    }
  } catch (error) {
    if (error.code !== "ERR_OUT_OF_RANGE") {
      throw error;
    }
  } finally {
    await events(Event.EndEvent);
  }
}

function isSupportedEvent(frames, pidAndTypeStart, typeEnd) {
  // This implementation accepts only events with one byte frames delta!
  if ((frames & 0x03) !== 0) return false;

  const pid = (pidAndTypeStart & 0b00011111);
  if ((pid !== 0) && (pid !== 1)) return false;

  const type = ((pidAndTypeStart & 0b11100000) >> 1) | (typeEnd & 0b00001111);
  return (type > 2);
}

async function readGameEvent(events, replay, game, decoder) {
  const frames = readFrames(decoder);
  const pid = decoder.readBits(5);
  const type = decoder.readBits(7);

  if (game.loop === undefined) {
    if ((type === 25) || (type === 27) || (type === 28) || (type === 103) || (type === 104) || (type === 105)) {
      game.loop = frames;
    }
  } else {
    game.loop += frames;
  }

  if (type === 25) {
    readManagerResetEvent(decoder);
  } else if (type === 27) {
    await readCommandEvent(events, replay, decoder, game.loop, pid + 1, game.selection[pid]);
  } else if (type === 28) {
    const selection = readSelectionEvent(decoder);

    if (selection) {
      game.selection[pid] = selection;
    }
  } else if (type === 103) {
    readManagerStateEvent(decoder);
  } else if (type === 104) {
    readUpdateTargetPointEvent(decoder);
  } else if (type === 105) {
    readUpdateTargetEvent(decoder);
  }
}

function readSelectionEvent(decoder) {
  let selection = null;

  decoder.readBits(4);
  decoder.readBits(9);

  switch (decoder.readBits(2)) {
    case 0: {
      break;
    }
    case 1: {
      const maskLength = decoder.readBits(8);
      decoder.readBits(maskLength);
      break;
    }
    default: {
      const indexCount = decoder.readBits(9);
      for (let i = 0; i < indexCount; i++) {
        decoder.readBits(9);
      }
    }
  }

  const subgroupsCount = decoder.readBits(9);
  for (let i = 0; i < subgroupsCount; i++) {
    decoder.readInt(16);
    decoder.readInt(8);
    decoder.readInt(8);
    decoder.readBits(9);
  }

  const unitTagsCount = decoder.readBits(9);
  for (let i = 0; i < unitTagsCount; i++) {
    selection = decoder.readInt(32);
  }

  return selection;
}

async function readCommandEvent(events, replay, decoder, loop, player, unitTag) {
  let event = null;

  // Read the flags and ignore them
  // Maybe later we'd like to track smart clicks and queued commands but not yet
  decoder.readBits(26);

  if (decoder.readBits(1)) {
    const abilityLink = decoder.readInt(16);
    const abilityCommandIndex = decoder.readBits(5);

    // Read the ability command data and ignore it
    if (decoder.readBits(1)) decoder.readInt(8);

    event = createEvent(abilityLink, abilityCommandIndex, loop, player, unitTag);

    if (event === Event.UnknownEvent) replay.warning("Unable to read some of the game events!");
  }

  switch (decoder.readBits(2)) {
    case 0: {
      break;
    }
    case 1: {
      // Read coordinates x, y, z of the target position and ignore them
      decoder.readBits(20);
      decoder.readBits(20);
      decoder.readInt(32);
      break;
    }
    case 2: {
      // Read the target flags, timer and ignore them
      decoder.readInt(16);
      decoder.readInt(8);

      const unitTag = decoder.readInt(32);

      // Read the unit link, control and upkeep player and ignore them
      decoder.readInt(16);
      if (decoder.readBits(1)) decoder.readBits(4);
      if (decoder.readBits(1)) decoder.readBits(4);

      // Read coordinates x, y, z of the target unit and ignore them
      decoder.readBits(20);
      decoder.readBits(20);
      decoder.readInt(32);

      if (event) {
        event.target = unitTag;
      }

      break;
    }
    case 3: {
      // Read the target data and ignore it
      decoder.readInt(32);
      break;
    }
  }

  // Read the sequence order of this command and ignore it
  decoder.readInt(32);

  // Read any other unit tag and ignore it
  if (decoder.readBits(1)) decoder.readInt(32);

  // Read any unit group and ignore it
  if (decoder.readBits(1)) decoder.readInt(32);

  await events(event);
}

function readManagerResetEvent(decoder) {
  decoder.readInt(32);
}

function readManagerStateEvent(decoder) {
  decoder.readBits(2);
  if (decoder.readBits(1)) decoder.readInt(32);
}

function readUpdateTargetPointEvent(decoder) {
  decoder.readBits(20);
  decoder.readBits(20);
  decoder.readBits(32);
}

function readUpdateTargetEvent(decoder) {
  decoder.readInt(16);
  decoder.readInt(8);
  decoder.readInt(32);
  decoder.readInt(16);
  if (decoder.readBits(1)) decoder.readBits(4);
  if (decoder.readBits(1)) decoder.readBits(4);
  decoder.readBits(20);
  decoder.readBits(20);
  decoder.readBits(32);
}

function readFrames(decoder) {
  const byte = decoder.readInt(8);
  const time = byte >> 2;
  const additional = byte & 0x03;

  if (additional === 0) {
    return time;
  } else if (additional === 1) {
    return time << 8 | decoder.readInt(8);
  } else if (additional === 2) {
    return time << 16 | decoder.readInt(16);
  } else if (additional === 3) {
    return time << 24 | decoder.readInt(16) << 8 | decoder.readInt(8);
  }
}
