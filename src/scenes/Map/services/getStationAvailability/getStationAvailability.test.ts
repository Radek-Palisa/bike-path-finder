import getStationAvailability from './getStationAvailability';

test('return 0 when there are no available bikes', () => {
  expect(getStationAvailability(0, 20)).toBe(0);
});

test('return 1 when station is full', () => {
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
