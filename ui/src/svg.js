
const LOOPS_PER_MINUTE = 60 * 22.4;
const SIZE_CELL = 60;
const SIZE_MAP = SIZE_CELL * 3;
const SHOW_RULE_GRID = false;

export default function(timeline, mapinfo) {
  const minutes = splitByMinute(timeline);
  const size = calculateSvgSize(minutes);
  const svg = [];

  svg.push(`<svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">`);
  svg.push(`<g style="user-select: none; font-family: 'Arial Narrow', Arial, sans-serif;">`);

  drawGrid(svg, size);
  drawMaps(svg, minutes, mapinfo);
  drawStats(svg, minutes);
  drawFights(svg, minutes);
  drawClock(svg, minutes);
  drawSeparators(svg, size, minutes);

  svg.push(`</g>`);
  svg.push(`</svg>`);

  return svg.join("\n");
}

function splitByMinute(timeline) {
  const minutes = [];

  for (const point of timeline) {
    addToMinutes(minutes, Math.floor(point.start / LOOPS_PER_MINUTE), point);
  }

  for (let minute = 0, y = 0; minute < minutes.length; minute++) {
    if (minutes[minute]) {
      minutes[minute].y = y;
      y += SIZE_CELL + (minutes[minute].fight ? SIZE_CELL + SIZE_CELL + SIZE_CELL : 0);
    } else {
      initMinute(minutes, minute).y = y;
      y += SIZE_CELL;
    }

    if (minute) {
      let a = minutes[minute - 1].stats[minutes[minute - 1].stats.length - 1];
      let b = minutes[minute].stats[0];

      if (b) minutes[minute - 1].stats.push(b);
      if (a && b && (b.start > minutes[minute].start)) minutes[minute].stats.unshift(a);
    }
  }

  return minutes;
}

function initMinute(minutes, minute) {
  if (!minutes[minute]) {
    minutes[minute] = { start: (minute * LOOPS_PER_MINUTE), clock: clock(minute), stats: [], fight: null, y: 0 };
  }
}

function addToMinutes(minutes, minute, point) {
  initMinute(minutes, minute);

  if (point.type === "fight") {
    minutes[minute].fight = point;
  } else if (point.type === "stats") {
    minutes[minute].stats.push(point);
  }
}

function calculateSvgSize(minutes) {
  let width = SIZE_CELL * 4 + SIZE_MAP + SIZE_CELL * 4;
  let height = 0;

  for (const minute of minutes) {
    height += SIZE_CELL + (minute.fight ? SIZE_CELL + SIZE_CELL + SIZE_CELL : 0);
  }

  return { width, height };
}

function clock(minute) {
  return ((minute < 10) ? "0" + minute : minute) + ":00";
}

function drawGrid(svg, size) {
  const a = SIZE_CELL * 4;
  const b = a + SIZE_MAP;

  svg.push(`<g id="grid" style="stroke: lightgray; stroke-width: 3;">`);
  svg.push(`<line x1="${a}" y1="0" x2="${a}" y2="${size.height}" />`);
  svg.push(`<line x1="${b}" y1="0" x2="${b}" y2="${size.height}" />`);
  svg.push(`</g>`);

  if (!SHOW_RULE_GRID) return;

  svg.push(`<g id="grid" style="stroke: lightgray; stroke-width: 1;">`);
  for (let x = 0; x <= size.width; x += SIZE_CELL) {
    svg.push(`<line x1="${x}" y1="0" x2="${x}" y2="${size.height}" />`);
  }
  for (let y = 0; y <= size.height; y += SIZE_CELL) {
    svg.push(`<line x1="0" y1="${y}" x2="${size.width}" y2="${y}" />`);
  }
  svg.push(`</g>`);
  svg.push(`<g id="grid" style="stroke: lightgray; stroke-width: 0.5;">`);
  for (let x = 0; x <= size.width; x += Math.floor(SIZE_CELL / 2)) {
    svg.push(`<line x1="${x}" y1="0" x2="${x}" y2="${size.height}" />`);
  }
  for (let y = 0; y <= size.height; y += Math.floor(SIZE_CELL / 2)) {
    svg.push(`<line x1="0" y1="${y}" x2="${size.width}" y2="${y}" />`);
  }
  svg.push(`</g>`);
}

function drawMaps(svg, minutes, mapinfo) {
  for (const minute of minutes) {
    drawMap(svg, minute, mapinfo.name, mapinfo.size);
  }
}

function drawMap(svg, minute, mapname, mapsize) {
  svg.push(`<g transform="translate(${SIZE_CELL * 4}, ${minute.y + SIZE_CELL})">`);

  const width = SIZE_CELL * 3;
  const height = SIZE_CELL * 3;
  const srcmap = "https://robobays.github.io/images/map/" + mapname.replace(".SC2Map", "") + ".jpg";

  svg.push(`<image width="${width}" height="${height}" href="${srcmap}" />`);

  const leftPlayer = minute.fight.players[1];
  const rightPlayer = minute.fight.players[2];

  const scaleX = width / mapsize.area.width;
  const scaleY = height / mapsize.area.height;

  const spots = new Set();
  const spotRadius = 12 * scaleX;
  for (const zone of leftPlayer.zones) if (zone) spots.add(zone);
  for (const zone of rightPlayer.zones) if (zone) spots.add(zone);
  svg.push(`<g style="fill: rgba(255, 255, 255, 0.5);">`);
  for (const spot of spots) {
    svg.push(`<circle cx="${getMapX(mapsize, scaleX, spot.x)}" cy="${getMapY(mapsize, height, scaleY, spot.y)}" r="${spotRadius}" />`);
  }
  svg.push("</g>");

  const baseWidth = 8 * scaleX;
  const baseHeight = 8 * scaleY;
  svg.push(`<g style="fill: #00AA00; stroke-width: ${scaleX}; stroke: white;">`);
  for (const base of leftPlayer.bases) {
    svg.push(`<rect x="${getMapX(mapsize, scaleX, base.x - 4)}" y="${getMapY(mapsize, height, scaleY, base.y + 4)}" width="${baseWidth}" height="${baseHeight}" />`);
  }
  svg.push("</g>");
  svg.push(`<g style="fill: #AA0000; stroke-width: ${scaleX}; stroke: white;">`);
  for (const base of rightPlayer.bases) {
    svg.push(`<rect x="${getMapX(mapsize, scaleX, base.x - 4)}" y="${getMapY(mapsize, height, scaleY, base.y + 4)}" width="${baseWidth}" height="${baseHeight}" />`);
  }
  svg.push("</g>");

  const fontSize = 16 * scaleY;
  const fontOffsetY = 6 * scaleY;
  svg.push(`<g style="fill: #00EE00; font-size: ${fontSize}; font-weight: 600; text-anchor: middle;">`);
  for (const zone of rightPlayer.zones) {
    svg.push(`<text x="${getMapX(mapsize, scaleX, zone.x)}" y="${getMapY(mapsize, height, scaleY, zone.y) + fontOffsetY}">&#9876;</text>`);
  }
  svg.push("</g>");
  svg.push(`<g style="fill: #EE0000; font-size: ${fontSize}; font-weight: 600; text-anchor: middle;">`);
  for (const zone of leftPlayer.zones) {
    svg.push(`<text x="${getMapX(mapsize, scaleX, zone.x)}" y="${getMapY(mapsize, height, scaleY, zone.y) + fontOffsetY}">&#9876;</text>`);
  }
  svg.push("</g>");
  
  svg.push("</g>");
}

function getMapX(mapsize, scale, x) {
  return (x - mapsize.area.left) * scale;
}

function getMapY(mapsize, height, scale, y) {
  return height - (y - mapsize.area.top) * scale;
}

function drawSeparators(svg, size, minutes) {
  svg.push(`<g id="separator" style="stroke: darkgray; stroke-width: 3;">`);

  for (const minute of minutes) {
    svg.push(`<line x1="0" y1="${minute.y + 1}" x2="${size.width}" y2="${minute.y + 1}" />`);
  }

  svg.push("</g>");
}

function drawClock(svg, minutes) {
  const x = SIZE_CELL * 5 - 1;

  svg.push(`<g id="clock" style="font-size: ${SIZE_CELL / 2}px; font-weight: bold;">`);

  for (const minute of minutes) {
    svg.push(`<text x="${x}" y="${minute.y + SIZE_CELL * 0.45}">${minute.clock}</text>`);
  }

  svg.push("</g>");
}

function drawStats(svg, minutes) {
  const offsetPlayer1 = SIZE_CELL * 4;
  const offsetPlayer2 = SIZE_CELL * 7;

  svg.push(`<g id="stats">`);

  // Military
  drawProgress(svg, minutes, 1, "activeForces", offsetPlayer2, +1, "#880000", "fill: none; stroke: #880000; stroke-width: 2; stroke-dasharray: 5,5;", iconSword);
  drawProgress(svg, minutes, 2, "activeForces", offsetPlayer1, -1, "#880000", "fill: none; stroke: #880000; stroke-width: 2; stroke-dasharray: 5,5;", iconSword);
  drawProgress(svg, minutes, 1, "activeForces", offsetPlayer1, -1, "#880000", "fill: none; stroke: #880000; stroke-width: 3;", iconSword);
  drawProgress(svg, minutes, 2, "activeForces", offsetPlayer2, +1, "#880000", "fill: none; stroke: #880000; stroke-width: 3;", iconSword);

  // Economy
  drawProgress(svg, minutes, 1, "activeWorkers", offsetPlayer2, +1, "#000088", "fill: none; stroke: #000088; stroke-width: 2; stroke-dasharray: 5,5;", iconChest);
  drawProgress(svg, minutes, 2, "activeWorkers", offsetPlayer1, -1, "#000088", "fill: none; stroke: #000088; stroke-width: 2; stroke-dasharray: 5,5;", iconChest);
  drawProgress(svg, minutes, 1, "activeWorkers", offsetPlayer1, -1, "#000088", "fill: none; stroke: #000088; stroke-width: 3;", iconChest);
  drawProgress(svg, minutes, 2, "activeWorkers", offsetPlayer2, +1, "#000088", "fill: none; stroke: #000088; stroke-width: 3;", iconChest);

  const offsetx = SIZE_CELL * 4.1;
  const offsetya = SIZE_CELL * 0.5;
  const offsetyah = SIZE_CELL * 0.6;
  const offsetyb = SIZE_CELL * 0.75;
  const offsetybh = SIZE_CELL * 0.85;
  const width = SIZE_CELL * 2.8;
  const height = SIZE_CELL * 0.2;
  const stroke = SIZE_CELL * 0.03;
  for (const minute of minutes) {
    let forcesPlayer1 = 0;
    let forcesPlayer2 = 0;
    let workerPlayer1 = 0;
    let workerPlayer2 = 0;
 
    for (const point of minute.stats) {
      forcesPlayer1 += point.players[1].resources.activeForces;
      forcesPlayer2 += point.players[2].resources.activeForces;
      workerPlayer1 += point.players[1].resources.activeWorkers;
      workerPlayer2 += point.players[2].resources.activeWorkers;
    }

    if (forcesPlayer1 || forcesPlayer2) {
      const forcesx = offsetx + (forcesPlayer1 / (forcesPlayer1 + forcesPlayer2)) * width;

      svg.push(`<rect x="${offsetx}" y="${minute.y + offsetya}" width="${width}" height="${height}" fill="#00AA00" />`);
      svg.push(`<rect x="${forcesx}" y="${minute.y + offsetya}" width="${width - (forcesx - offsetx)}" height="${height}" fill="#AA0000" />`);
      svg.push(`<rect x="${forcesx - height / 2}" y="${minute.y + offsetya}" width="${height}" height="${height}" rx="${stroke}" ry="${stroke}" fill="white" stroke="#880000" stroke-width="${stroke}" />`);
      iconSword(svg, forcesx, minute.y + offsetyah, height, height, "#880000");
    }

    if (workerPlayer1 || workerPlayer2) {
      const workerx = offsetx + (workerPlayer1 / (workerPlayer1 + workerPlayer2)) * width;
      svg.push(`<rect x="${offsetx}" y="${minute.y + offsetyb}" width="${width}" height="${height}" fill="#00AA00" />`);
      svg.push(`<rect x="${workerx}" y="${minute.y + offsetyb}" width="${width - (workerx - offsetx)}" height="${height}" fill="#AA0000" />`);
      svg.push(`<rect x="${workerx - height / 2}" y="${minute.y + offsetyb}" width="${height}" height="${height}" rx="${stroke}" ry="${stroke}" fill="white" stroke="#000088" stroke-width="${stroke}" />`);
      iconChest(svg, workerx, minute.y + offsetybh, height, height, "#000088");
    }
  }

  svg.push(`</g>`);
}

function drawProgress(svg, minutes, player, resource, offset, direction, color, style, icon) {
  const path = [];
  let max = 1;
  let startx = 0;
  let bx = 0;
  let by = 0;

  for (const minute of minutes) {
    for (const point of minute.stats) {
      max = Math.max(max, point.players[1].resources[resource]);
      max = Math.max(max, point.players[2].resources[resource]);
    }
  }

  for (const minute of minutes) {
    let bt = "M";

    for (const point of minute.stats) {
      const value = point.players[player].resources[resource];

      if (value >= 0) {
        let px = offset + direction * value * SIZE_CELL * 3 / max;
        let py = minute.y + (point.start - minute.start) * SIZE_CELL / LOOPS_PER_MINUTE;

        if (bt === "M") {
          const part = (py - by) ? (minute.y - by) / (py - by) : 1;

          px = bx + (px - bx) * part;
          py = by + (py - by) * part;
        } else if (py > minute.y + SIZE_CELL) {
          const part = (minute.y + SIZE_CELL - by) / (py - by);

          px = bx + (px - bx) * part;
          py = by + (py - by) * part;
        }

        path.push(`${bt}${px},${py}`);

        bt = "L";
        bx = px;
        by = py;

        if (!startx) startx = px;
      }
    }
  }

  svg.push(`<path d="${path.join(" ")}" style="${style}" />`);

  const top = SIZE_CELL * 0.1;
  const height = SIZE_CELL * 0.2;
  const stroke = SIZE_CELL * 0.03;
  svg.push(`<rect x="${startx - height / 2}" y="${top}" width="${height}" height="${height}" rx="${stroke}" ry="${stroke}" fill="white" stroke="${color}" stroke-width="${stroke}" />`);
  icon(svg, startx, top + height / 2, height, height, color);
}

function drawFights(svg, minutes) {
  const offsetPlayer1 = SIZE_CELL * 4;
  const offsetPlayer2 = SIZE_CELL * 7;

  for (const minute of minutes) {
    if (minute.fight) {
      drawUnits(svg, minute.y, minute.fight, 1, offsetPlayer1, -1);
      drawUnits(svg, minute.y, minute.fight, 2, offsetPlayer2, +1);
      drawWinnerCrown(svg, minute.y, minute.fight);
    }
  }
}

function drawWinnerCrown(svg, y, fight) {
  const cy = y + SIZE_CELL * 0.27;
  const cr = SIZE_CELL * 0.21;
  const cs = SIZE_CELL * 0.38;

  if (fight.players[1].loss < fight.players[2].loss) {
    svg.push(`<circle cx="${SIZE_CELL * 4.5}" cy="${cy}" r="${cr}" fill="#00AA00" />`);
    iconCrown(svg, SIZE_CELL * 4.5, cy, cs, cs);
  } else if (fight.players[1].loss > fight.players[2].loss) {
    svg.push(`<circle cx="${SIZE_CELL * 6.5}" cy="${cy}" r="${cr}" fill="#AA0000" />`);
    iconCrown(svg, SIZE_CELL * 6.5, cy, cs, cs);
  }
}

function drawUnits(svg, y, fight, player, offset, direction) {
  const data = fight.players[player];
  const slots = [];

  for (const unit in data.units) {
    slots.push({ ...data.units[unit], unit, x: 0, y: 0 });
  }
  arrangeSlots(slots, offset, y, direction);

  for (const slot of slots) {
    drawUnit(svg, slot);
  }
}

function drawUnit(svg, slot) {
  const c = slot.w;

  svg.push(`<g transform="translate(${slot.x}, ${slot.y})">`);

  if (!slot.unit) {
    const mx = c / 4;
    const dx = 0.001;
    const style = `fill: none; stroke: gray; stroke-width: ${c / 7}; stroke-linecap: round;`;

    svg.push(`<path d="m${mx},${c / 2} l${dx},0 m${mx},0 l${dx},0 m${mx},0 l${dx},0" style="${style}" />`);
    svg.push("</g>");
    return;
  }

  const srcicon = "https://robobays.github.io/images/unit/" + slot.unit + ".webp";
  const stylerounded = "clip-path: inset(0 0 0 0 round 20%)";

  // Count and image on top
  svg.push(`<text x="${c*0.25}" y="${c*0.4}" text-anchor="middle" style="font-size: ${c*0.4};">${slot.count}</text>`);
  svg.push(`<image x="${c*0.5}" y="0" width="${c*0.5}" height="${c*0.5}" href="${srcicon}" style="${stylerounded}" />`);

  // Born count as number bottom-left
  if (slot.born) {
    iconEgg(svg, c*0.13, c*0.63, c*0.16, c*0.16);
    svg.push(`<text x="${c*0.35}" y="${c*0.7}" text-anchor="middle" style="font-size: ${c*0.2};">${slot.born}</text>`);
  }

  // Dead count as number bottom-left
  if (slot.died) {
    iconSkull(svg, c*0.13, c*0.83, c*0.16, c*0.16);
    svg.push(`<text x="${c*0.35}" y="${c*0.9}" text-anchor="middle" style="font-size: ${c*0.2};">${slot.died}</text>`);
  }

  // Born and died count as strikes bottom-right
  const born = Math.min(slot.born, slot.count - slot.died);
  const alive = slot.count - slot.died;
  const cols = Math.ceil(Math.sqrt(slot.count) / 5) * 5;
  const rows = Math.max(Math.ceil(slot.count / cols), 2);
  const dx = c * 0.45 / cols;
  const dy = c * 0.45 / rows;
  const w = dx * 0.4;
  const h = dy * 0.8;
  let col = 0;
  let x = c * 0.55;
  let y = c * 0.55;

  svg.push(`<g style="stroke: darkgreen; stroke-width: ${w};">`);
  for (let i = 0; i < born; i++, col++, x += dx) {
    if (col >= cols) { col = 0; x = c * 0.55; y += dy; }
    svg.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" />`);
  }
  svg.push(`</g>`);
  svg.push(`<g style="stroke: darkgray; stroke-width: ${w};">`);
  for (let i = born; i < alive; i++, col++, x += dx) {
    if (col >= cols) { col = 0; x = c * 0.55; y += dy; }
    svg.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" />`);
  }
  svg.push(`</g>`);
  svg.push(`<g style="stroke: red; stroke-width: ${w};">`);
  for (let i = alive; i < slot.count; i++, col++, x += dx) {
    if (col >= cols) { col = 0; x = c * 0.55; y += dy; }
    svg.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" />`);
  }
  svg.push(`</g>`);

  // Gray outline with title
  svg.push(`<rect width="${c}" height="${c}" rx="${c * 0.1}" ry="${c * 0.1}" stroke="gray" stroke-width="${c * 0.01}" fill="rgba(0, 0, 0, 0.01)">`);
  svg.push(`<title>${slot.unit}</title>`);
  svg.push(`</rect>`);

  svg.push(`</g>`);
}

function arrangeSlots(slots, x, y, direction) {
  const list = { base: [], worker: [], economy: [], defense: [], offense: [] };
  let army = []; // Slots in upper two rows
  let tech = []; // Slots in lower row

  for (const slot of slots) list[slot.type].push(slot);

  army = list.offense;

  if (!army.length) {
    army = list.defense;
    list.defense = [];
  } else if (army.length + list.defense.length <= 8) {
    army = [...army, ...list.defense];
    list.defense = [];
  }

  if (!army.length) {
    army = list.worker;
    list.worker = [];
  }

  tech = [...list.defense, ...list.worker, ...list.base, ...list.economy];

  if (army.length + tech.length <= 2) {
    army = [...army, ...tech];
    tech = [];
  }

  // Order upper two rows
  army.sort(orderSlots);

  for (let i = 0; i < army.length; i++) {
    army[i].x = x + direction * i * SIZE_CELL - ((direction < 0) ? SIZE_CELL : 0);
    army[i].y = y + SIZE_CELL;
  }

  // Order lower row
  // TODO: If no losses then keep the order of defense, worker, base, economy
  tech.sort(orderSlots);

  arrangeSlotsInTwoRows(army, x, y + SIZE_CELL, direction);
  arrangeSlotsInOneRow(tech, x, y + SIZE_CELL + SIZE_CELL + SIZE_CELL, SIZE_CELL, 4, direction);
}

function arrangeSlotsInTwoRows(slots, x, y, direction) {
  if (!slots.length) return;

  if (slots.length <= 5) {
    // Use at least one large slot
    arrangeSlotsInOneRow(slots, x, y, SIZE_CELL + SIZE_CELL, 2, direction);
  } else {
    // Use two rows with normal slots
    arrangeSlotsInOneRow(slots.slice(0, 4), x, y, SIZE_CELL, 4, direction);
    arrangeSlotsInOneRow(slots.slice(4), x, y + SIZE_CELL, SIZE_CELL, 4, direction);
  }
}

function arrangeSlotsInOneRow(slots, x, y, size, cols, direction) {
  const reverse = (direction < 0);
  const startx = x - (reverse ? size : 0);
  let j;

  if (slots.length <= cols * 4) {
    const splits = (slots.length > cols) ? Math.ceil((slots.length - cols) / 3) : 0;
    const normal = Math.max(cols - splits, 0);

    for (let i = 0; (i < normal) && (i < slots.length); i++) {
      slots[i].x = startx + direction * i * size;
      slots[i].y = y;
      slots[i].w = size;
    }

    j = normal;
  } else {
    slots.length = cols * 4;
    slots[cols * 4 - 1].unit = null; // Last slot shows dots
    j = 0;
  }

  for (let i = j; i < cols; i++) {
    const halfsize = size / 2;
    const slotx = startx + direction * i * size;
    const slotxa = slotx + (reverse ? halfsize : 0);
    const slotxb = slotx + (reverse ? 0 : halfsize);
    const slotya = y;
    const slotyb = y + halfsize;

    if (j < slots.length) arrangeSlot(slots[j++], slotxa, slotya, halfsize);
    if (j < slots.length) arrangeSlot(slots[j++], slotxa, slotyb, halfsize);
    if (j < slots.length) arrangeSlot(slots[j++], slotxb, slotya, halfsize);
    if (j < slots.length) arrangeSlot(slots[j++], slotxb, slotyb, halfsize);
  }
}

function arrangeSlot(slot, x, y, w) {
  slot.x = x;
  slot.y = y;
  slot.w = w;
}

function orderSlots(a, b) {
  // First by total value
  if (a.value !== b.value) return b.value - a.value;

  // Finally by first to be created
  return a.enter - b.enter;
}

function iconChest(svg, x, y, width, height, color) {
  svg.push(`<g style="fill: none; stroke: ${color}; stroke-width: 1;" transform="translate(${x}, ${y})">`);
  svg.push(`<path d="m-3,-1 l5,-2 q2,0 2,2 l0,3 l-5,2 l-3,-2 l0,-2 q0,-1 1,-1 q2,0 2,2 l0,3 m0,-3 l5,-2 m-2.5,2 l0,1" transform="scale(${width / 10}, ${height / 10})" />`);
  svg.push(`</g>`);
}

function iconCrown(svg, x, y, width, height) {
  svg.push(`<g style="fill: none; stroke: gold; stroke-width: 1;" transform="translate(${x}, ${y})">`);
  svg.push(`<path d="m-3,-3 l0,6 l6,0 l0,-6 l-2,2 l-1,-2 l-1,2 l-2,-2 m1,4 l0,1 m2,-1 l0,1 m2,-1 l0,1" transform="scale(${width / 10}, ${height / 10})" />`);
  svg.push(`</g>`);
}

function iconEgg(svg, x, y, width, height) {
  svg.push(`<g style="fill: none; stroke: darkgray; stroke-width: 1;" transform="translate(${x}, ${y})">`);
  svg.push(`<path d="m-3,1 A3,3 0 1 0 3,1 q-3,-10 -6,0 m2,-1 l1,-1.5 l1,0.5 l1,-1" transform="scale(${width / 10}, ${height / 10})" />`);
  svg.push(`</g>`);
}

function iconSkull(svg, x, y, width, height) {
  svg.push(`<g style="fill: none; stroke: darkgray; stroke-width: 1;" transform="translate(${x}, ${y})">`);
  svg.push(`<path d="m-0.5,4 q-1.5,0 -1.5,-1 l0,-1.5 q-1,0 -1,-1.5 A3,-4 0 1 1 3,0 q0,1.5 -1,1.5 l0,1.5 q0,1 -2.5,1 l0,-2 m-0.5,-2 l0,-1 m2,0 l0,1" transform="scale(${width / 10}, ${height / 10})" />`);
  svg.push(`</g>`);
}

function iconSword(svg, x, y, width, height, color) {
  svg.push(`<g style="fill: none; stroke: ${color}; stroke-width: 1;" transform="translate(${x}, ${y})">`);
  svg.push(`<path d="m3.5,-3.5 l-1,2 l-3,3 l0,1 l-1,0 l-1,1 q-1,0 -1,-1 l1,-1 l0,-1 l1,0 l3,-3 Z" transform="scale(${width / 10}, ${height / 10})" />`);
  svg.push(`<path d="m-1,1 l3,-3" stroke-width="0.2" transform="scale(${width / 10}, ${height / 10})" />`);
  svg.push(`</g>`);
}
