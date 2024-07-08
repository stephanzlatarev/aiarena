const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ONE_HOUR = 2 * 60 * 60 * 1000;
const TWO_HOURS = 2 * ONE_HOUR;
const ONE_DAY = 24 * ONE_HOUR;
const TWO_DAYS = 2 * ONE_DAY;
const ONE_MONTH = 30 * ONE_DAY;

export default function(time) {
  if (!time) return "";

  const date = new Date(time);
  const diff = Date.now() - date.getTime();

  if (diff < TWO_HOURS) return "just now";
  if (diff < TWO_DAYS) return Math.floor(diff / ONE_HOUR) + " hours ago";
  if (diff < ONE_MONTH) return Math.floor(diff / ONE_DAY) + " days ago";

  return MONTHS[date.getMonth()] + " " + date.getDate();
}
