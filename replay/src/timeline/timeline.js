import ReplayTimeline from "@robobays/replay-timeline";
import requestSummary from "./summary.js";

export default async function timeline(match, mapName) {
  const timeline = await ReplayTimeline.from(match.replay).json();

  requestSummary(match, mapName, timeline);

  return timeline;
}
