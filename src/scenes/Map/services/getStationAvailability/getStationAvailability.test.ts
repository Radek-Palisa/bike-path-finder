import getStationAvailability, { roundToOneDecimal } from './getStationAvailability';

test('should round number to one decimal within the given range', () => {
  expect(roundToOneDecimal(0.976, 0.2, 0.9)).toBe(0.9);
  expect(roundToOneDecimal(0.26, 0.2, 0.9)).toBe(0.3);
  expect(roundToOneDecimal(0.03, 0.1, 0.9)).toBe(0.1);
});

test('return correct percentage when station is completely full or empty', () => {
  expect(getStationAvailability(0, 20)).toBe(0);
  expect(getStationAvailability(20, 20)).toBe(1);
});

test('if more than 10 bikes are available, fill percentage should be at least 0.5', () => {
  expect(getStationAvailability(12, 30)).toBe(0.6);
});

test('if less than 10 bikes are available, show real fill percentage', () => {
  expect(getStationAvailability(8, 20)).toBe(0.4);
});

test('minimum percentage of available bikes is 0.2', () => {
  expect(getStationAvailability(1, 40)).toBe(0.2);
});

test('when station is not full, maximum percentage of available bikes is 0.9', () => {
  expect(getStationAvailability(19, 20)).toBe(0.9);
});
