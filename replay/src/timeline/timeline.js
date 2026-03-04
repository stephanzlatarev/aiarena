import ReplayTimeline from "@robobays/replay-timeline";

export default async function timeline(match) {
  return await ReplayTimeline.from(match.replay).json();
}
