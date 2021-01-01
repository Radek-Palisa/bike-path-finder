import { renderHook } from '@testing-library/react-hooks';
import useMap from '../useMap';

jest.mock('@googlemaps/js-api-loader', () => {
  return {
    Loader: jest.fn().mockImplementation(() => ({
      load: () => Promise.resolve(),
    })),
  };
});

describe('useMap', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });
  });

  it('stores an instance of google Map to its state', async () => {
    class mockMapConstructor {
      addListener = jest.fn();
    }

    window.google = {
      maps: {
        Map: mockMapConstructor,
      },
    } as any;

    const { result, rerender, waitForNextUpdate } = renderHook(() =>
      useMap({ current: document.createElement('div') })
    );

    expect(result.current).toBe(null);

    await waitForNextUpdate();

    expect(result.current).toBeInstanceOf(mockMapConstructor);

    rerender();

    expect(result.current).toBeInstanceOf(mockMapConstructor);
  });
  it('initializes the map with the default settings', async () => {
    const mapConstructorSpy = jest.fn().mockImplementation(() => ({
      addListener: jest.fn(),
    }));

    window.google = {
      maps: {
        Map: mapConstructorSpy,
      },
    } as any;

    const divElement = document.createElement('div');

    const { waitForNextUpdate } = renderHook(() => useMap({ current: divElement }));

    await waitForNextUpdate();

    expect(mapConstructorSpy).toHaveBeenCalledWith(divElement, {
      center: { lat: 41.384832, lng: 2.1722708 },
      zoom: 14,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
    });
  });
  it('attaches an on-idle listener on the map which stores the last map center in local storage', async () => {
    const latLng = {
      lat: 42.44,
      lng: 2.34,
    };
    const mockAddListener = jest.fn();
    class mockMapConstructor {
      addListener = mockAddListener;
      getCenter = () => {
        return {
          toJSON: () => latLng,
        };
      };
      getZoom = () => 14;
    }

    window.google = {
      maps: {
        Map: mockMapConstructor,
      },
    } as any;

    const { waitForNextUpdate } = renderHook(() =>
      useMap({ current: document.createElement('div') })
    );

    await waitForNextUpdate();

    expect(mockAddListener.mock.calls[0][0]).toBe('idle');
    const idleCallback = mockAddListener.mock.calls[0][1];

    idleCallback();

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'lastMapCenter',
      JSON.stringify({
        ...latLng,
        zoom: 14,
      })
    );
  });

  it('initiliazes map from data from local storage', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(
      '{ "lat": 43.54, "lng": 2.88, "zoom": 16 }'
    );

    const mockMapConstructor = jest.fn().mockImplementation(() => ({
      addListener: jest.fn(),
    }));

    window.google = {
      maps: {
        Map: mockMapConstructor,
      },
    } as any;

    const { waitForNextUpdate } = renderHook(() =>
      useMap({ current: document.createElement('div') })
    );

    await waitForNextUpdate();

    expect(window.localStorage.getItem).toHaveBeenCalledWith('lastMapCenter');
    expect(mockMapConstructor).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        center: {
          lat: 43.54,
          lng: 2.88,
        },
        zoom: 16,
      })
    );
  });
});
