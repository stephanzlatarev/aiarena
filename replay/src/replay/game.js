
export default function readGameEvents(replay, decoder) {
  const game = {
    loop: 0,
    selection: [new Set(), new Set()],
  }

  decoder.index = 230*14 + 5;
  game.loop = 5;

  readGameEvent(game, decoder);
  readGameEvent(game, decoder);
  readGameEvent(game, decoder);
  readGameEvent(game, decoder);
}

function readGameEvent(game, decoder) {
  const frames = readFrames(decoder);
  const pid = decoder.readBits(5);
  const type = decoder.readBits(7);

  game.loop += frames;

  console.log("========= loop:", game.loop, "pid:", pid, "type:", type);

  if (type === 27) {
    readCommandEvent(decoder);
  } else if (type === 28) {
    readSelectionEvent(decoder, game.selection[pid]);
  } else {
    console.log("Unsupported type for game event:", type);
  }

  decoder.skipToByte();
}

function readSelectionEvent(decoder, selection) {
  decoder.readBits(4);
  decoder.readBits(9);

  switch (decoder.readBits(2)) {
    case 0: {
      break;
    }
    case 1: {
      console.log("TODO: Implement remove items from selection");
      break;
    }
    case 2: {
      console.log("TODO: Implement remove items from selection");
      break;
    }
    case 3: {
      console.log("TODO: Implement remove items from selection");
      const count = decoder.readBits(9);
      console.log("remove", count, "items from selection");
      for (let i = 0; i < count; i++) {
        const item = decoder.readBits(9);
        console.log("remove ZeroIndices", item);
      }
      break;
    }
  }

  const subgroupsCount = decoder.readBits(9);
  console.log("add", subgroupsCount, "subgroups to selection");
  for (let i = 0; i < subgroupsCount; i++) {
    const unitLink = decoder.readInt(16);
    const subgroupPriority = decoder.readInt(8);
    const intraSubgroupPriority = decoder.readInt(8);
    const count = decoder.readBits(9);
    console.log("subgroup:", unitLink, subgroupPriority, intraSubgroupPriority, count);
  }

  const unitTagsCount = decoder.readBits(9);
  console.log("add", unitTagsCount, "unit tags to selection");
  for (let i = 0; i < unitTagsCount; i++) {
    const unitTag = decoder.readInt(32);
    console.log("unit tag:", unitTag);
    selection.add(unitTag);
  }
}

function readCommandEvent(decoder) {
  const flags = readFlags(decoder.readBits(26));
  console.log("flags:", flags);

  if (decoder.readBits(1)) {
    console.log("has ability!");

    const abilityLink = decoder.readInt(16);
    const abilityCommandIndex = decoder.readBits(5);
    const abilityCommandData = decoder.readBits(1) ? decoder.readInt(8) : null;

    console.log("ability:", abilityLink, abilityCommandIndex, abilityCommandData);
  }

  switch (decoder.readBits(2)) {
    case 0: {
      break;
    }
    case 1: {
      console.log("TODO: Implement target 1");
      break;
    }
    case 2: {
      console.log("TODO: Implement target 2");
      break;
    }
    case 3: {
      console.log("TODO: Implement target 3");
      break;
    }
  }
  const sequence = decoder.readInt(32) + 1;
  console.log("sequence:", sequence);

  if (decoder.readBits(1)) {
    const otherUnitTag = decoder.readInt(32);
    console.log("other unit tag:", otherUnitTag);
  }

  if (decoder.readBits(1)) {
    const unitGroup = decoder.readInt(32);
    console.log("unit group:", unitGroup);
  }
}

function readFrames(decoder) {
  const byte = decoder.readBits(8);
  const time = byte >> 2;
  const additional = byte & 0x03;

  if (additional === 0) {
    return time;
  } else if (additional === 1) {
    return time << 8 | decoder.readBits(8);
  } else if (additional === 2) {
    return time << 16 | decoder.readBits(16);
  } else if (additional === 3) {
    return time << 24 | decoder.readBits(16) << 8 | decoder.readBits(8);
  }
}

function readFlags(flags) {
  const list = [];

  if (0x1 & flags) list.push("alternate");
  if (0x2 & flags) list.push("queued");
  if (0x4 & flags) list.push("preempt");
  if (0x8 & flags) list.push("smart_click");
  if (0x10 & flags) list.push("smart_rally");
  if (0x20 & flags) list.push("subgroup");
  if (0x40 & flags) list.push("set_autocast");
  if (0x80 & flags) list.push("set_autocast_on");
  if (0x100 & flags) list.push("user");
  if (0x200 & flags) list.push("data_passenger");
  if (0x400 & flags) list.push("data_abil_queue_order_id");
  if (0x800 & flags) list.push("ai");
  if (0x1000 & flags) list.push("ai_ignore_on_finish");
  if (0x2000 & flags) list.push("is_order");
  if (0x4000 & flags) list.push("script");
  if (0x8000 & flags) list.push("homogenous_interruption");
  if (0x10000 & flags) list.push("minimap");
  if (0x20000 & flags) list.push("repeat");
  if (0x40000 & flags) list.push("dispatch_to_other_unit");
  if (0x80000 & flags) list.push("target_self");

  return list;
}
