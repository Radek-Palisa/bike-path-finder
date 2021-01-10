const roundToOneDecimal = (number: number, min: number, max: number) =>
  Math.min(Math.max(Math.round((number + Number.EPSILON) * 10) / 10, min), max);

export default function getStationAvailability(availableBikes: number, capacity: number) {
  // Real average half capacity is 27.5 / 2 but 10 is a reasonably high number
  const halfCapacity = 10;

  const percAvailableBikes = availableBikes / capacity;

  // For better visibility, if there are bikes available the minimum fill is 0.2
  // and if it's not completely full the max is 0.9.
  if (percAvailableBikes === 0) {
    return 0;
  }
  if (percAvailableBikes > 0.9 && percAvailableBikes < 1) {
    return 0.9;
  }
  // Since 10 bikes is already a pretty high number of bikes, regardless of the actual station capacity,
  // we will show it at least half full. The other half of the fill depends on the stations capacity.
  if (availableBikes >= halfCapacity) {
    const intuitiveFillPercentage =
      0.5 + ((availableBikes - halfCapacity) / (capacity - halfCapacity)) * 0.5;

    return roundToOneDecimal(intuitiveFillPercentage, 0.2, 1);
  }
  return roundToOneDecimal(percAvailableBikes, 0.2, 1);
}
