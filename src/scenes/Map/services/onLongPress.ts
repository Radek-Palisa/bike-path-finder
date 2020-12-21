type RemoveOnLongPressListener = () => void;

export default function onLongPress(
  map: google.maps.Map,
  handler: (event: google.maps.MouseEvent) => void,
  options: { timeout?: number } = {}
): RemoveOnLongPressListener {
  let timeoutId: any = null;

  const mouseDownListener = map.addListener('mousedown', event => {
    timeoutId = setTimeout(() => {
      handler(event);
    }, options.timeout ?? 500);
  });

  const mouseUpListener = map.addListener('mouseup', () => {
    clearTimeout(timeoutId);
  });

  return () => {
    mouseDownListener.remove();
    mouseUpListener.remove();
  };
}
