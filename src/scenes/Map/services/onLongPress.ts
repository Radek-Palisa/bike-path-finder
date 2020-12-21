type RemoveOnLongPressListener = () => void;

export default function onLongPress(
  map: google.maps.Map,
  handler: (event: google.maps.MouseEvent) => void,
  options: { timeout?: number } = {}
): RemoveOnLongPressListener {
  let timeoutId: any = null;
  let isLongPressing = false;
  let isDragging = false;

  const mouseDownListener = map.addListener('mousedown', event => {
    isLongPressing = false;
    isDragging = false;

    timeoutId = setTimeout(() => {
      // pressing down and then dragging is not meant to
      // trigger the 'long press' event.
      if (isDragging) return;

      isLongPressing = true;
      handler(event);
    }, options.timeout ?? 500);
  });

  const mouseUpListener = map.addListener('mouseup', e => {
    // normally 'click' is fired after 'mouseup' so in order for it not to
    // get mixed up with other functionality, stop the event propagation.
    if (
      isLongPressing ||
      // after dragging, a 'click' is not fired, so this is not strictly
      // necessary but just to be bullet-proof.
      isDragging
    ) {
      e.stop();
    }
    clearTimeout(timeoutId);
  });

  const dragStartListener = map.addListener('dragstart', () => {
    isDragging = true;
  });

  return () => {
    mouseDownListener.remove();
    mouseUpListener.remove();
    dragStartListener.remove();
  };
}
