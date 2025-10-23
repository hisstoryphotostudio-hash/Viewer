export function defaultYear() {
  return new Date().getFullYear();
}
export function defaultMonth2() {
  return new Date().getMonth() + 1;
}
export function prevMonth(m) {
  return m === 1 ? 12 : m - 1;
}
export function monthName(i) {
  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][i];
}
