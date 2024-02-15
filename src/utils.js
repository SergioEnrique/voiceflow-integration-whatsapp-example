export const rndID = () => {
  // Random Number Generator
  const randomNo = Math.floor(Math.random() * 1000 + 1);
  // get Timestamp
  const timestamp = Date.now();
  // get Day
  const date = new Date();
  const weekday = new Array(7);
  weekday[0] = 'Sunday';
  weekday[1] = 'Monday';
  weekday[2] = 'Tuesday';
  weekday[3] = 'Wednesday';
  weekday[4] = 'Thursday';
  weekday[5] = 'Friday';
  weekday[6] = 'Saturday';
  const day = weekday[date.getDay()];
  return randomNo + day + timestamp;
};

export const truncateString = (str, maxLength = 20) => {
  if (str) {
    if (str.length > maxLength) {
      return `${str.substring(0, maxLength - 1)}…`;
    }
    return str;
  }
  return '';
};
