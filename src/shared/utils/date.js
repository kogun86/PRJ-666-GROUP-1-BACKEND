function getWeekdayNumber(weekday) {
  const dayNameToNumber = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const dayNumber = dayNameToNumber[weekday.toLowerCase()];
  if (dayNumber === undefined) {
    throw new Error(`Invalid weekday name: ${weekday}`);
  }
  return dayNumber;
}

function getDatesForWeekdays(startDate, endDate, weekdays) {
  // Get target weekdays as numbers
  const targetDays = new Set(weekdays.map((day) => getWeekdayNumber(day)));

  const result = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  // Loop until we reach endDate
  while (current <= endDate) {
    if (targetDays.has(current.getDay())) {
      result.push(new Date(current));
    }

    // Find the minimum days to next valid weekday
    const nextOffsets = [...targetDays].map((d) => (d - current.getDay() + 7) % 7 || 7);
    const minOffset = Math.min(...nextOffsets);
    current.setDate(current.getDate() + minOffset);
  }

  return result;
}

export { getDatesForWeekdays };
