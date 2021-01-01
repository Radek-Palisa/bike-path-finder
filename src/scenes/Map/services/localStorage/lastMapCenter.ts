const LOCALE_STORAGE_LAST_MAP_CENTER_KEY = 'lastMapCenter';

type LastMapCenter = {
  lat: number;
  lng: number;
  zoom: number;
};

export function getLastMapCenterFromLocalStorage(): LastMapCenter | null {
  const data = window.localStorage.getItem(LOCALE_STORAGE_LAST_MAP_CENTER_KEY);

  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setLastMapCenterToLocalStorage(data: LastMapCenter) {
  window.localStorage.setItem(LOCALE_STORAGE_LAST_MAP_CENTER_KEY, JSON.stringify(data));
}
