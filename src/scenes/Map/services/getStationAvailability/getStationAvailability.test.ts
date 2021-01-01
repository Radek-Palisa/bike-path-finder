import getStationAvailability from './getStationAvailability';

describe('getStationAvailability', () => {
  it('returns correct percentage when station is completely full or empty', () => {
    expect(getStationAvailability(0, 20)).toBe(0);
    expect(getStationAvailability(20, 20)).toBe(1);
  });

  it('returns at least 0.5 when more than 10 bikes are available', () => {
    expect(getStationAvailability(12, 30)).toBe(0.6);
  });

  it('returns real fill percentage if less than 10 bikes are available', () => {
    expect(getStationAvailability(8, 20)).toBe(0.4);
  });

  it('returns a minimum of 0.2', () => {
    expect(getStationAvailability(1, 40)).toBe(0.2);
  });

  it('returns a maximum of 0.9 when station is not full', () => {
    expect(getStationAvailability(19, 20)).toBe(0.9);
  });

  it('rounds result to one decimal', () => {
    expect(getStationAvailability(9, 20)).toBe(0.5);
  });

  it('returns a valid number as fallback even if invalid values are passed', () => {
    expect(getStationAvailability(24, 20)).toBe(1);
  });
});
