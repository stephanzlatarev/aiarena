import { addBuildOrder } from "../src/timeline/buildorder.js";

const tree = {
  bot: "norman",
  map: null,
  opponent: null,
  win: 500,
  loss: 400,
  tie: 200,
  terran: 1000,
  zerg: 2000,
  protoss: 3000,
  random: 4000,
  production: {
    Probe: { start: 20, count: 5, end: 150 },
  },
  decisions: [
    {
      map: null,
      opponent: null,
      win: 1,
      loss: 1,
      tie: 1,
      terran: 1,
      zerg: 1,
      protoss: 1,
      random: 1,
      actions: [
        { build: "Gateway", after: 12, before: 15 },
      ],
      decisions: [],
    },
    {
      map: null,
      opponent: null,
      win: 1,
      loss: 1,
      tie: 1,
      terran: 1,
      zerg: 1,
      protoss: 1,
      random: 1,
      actions: [
        { build: "Probe", after: 12, before: 15 },
        { build: "Nexus", after: 20, before: 20 },
      ],
      decisions: [],
    },
  ],
};
const build = [
  { loop: 23, build: "Probe", x: 101, y: 1001 },
  { loop: 46, build: "Probe", x: 101, y: 1001 },
  { loop: 69, build: "Probe", x: 101, y: 1001 },
  { loop: 100, build: "Pylon", x: 101, y: 1001 },
  { loop: 200, build: "Gateway", x: 201, y: 201 },
  { loop: 300, build: "Nexus", x: 201, y: 201 },
  { loop: 400, build: "Gateway", x: 301, y: 301 },
];

const result = addBuildOrder("norman", "TestMap", "P", "nida", "norman", tree, build);

console.log(JSON.stringify(result, null, 2));

/*
Test:
- When first action matches decision but rest of production is not complete, then split is needed
- A stream of units matches production and cascaded decisions
- A stream of units doesn't mathc production of one decision
- One-off unit matches production
- One-off unit doesn't match production
- Two one-off units in different order
- Production stops
*/

