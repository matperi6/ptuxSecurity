(() => {
  const workspace = document.querySelector('.workspace');
  if (!workspace) return;

  const columns = [...workspace.querySelectorAll(':scope > .column')];
  if (columns.length !== 3) return;

  const columnMinimums = [180, 340, 220];
  const columnMaximumRatios = [0.46, 0.82, 0.46];
  const columnRowsMinimums = [
    [110, 110, 110],
    [180, 180],
    [80, 120, 120, 120],
  ];
  const rowMaximumRatio = 0.72;
  const narrowScreen = () => window.matchMedia('(max-width: 600px)').matches;
  let drag = null;

  const getTracks = (container, axis) => axis === 'column'
    ? [...container.children].filter((child) => child.classList.contains('column'))
    : [...container.children].filter((child) => child.classList.contains('panel'));
  const getSizes = (tracks, axis) => tracks.map((track) => {
    const bounds = track.getBoundingClientRect();
    return axis === 'column' ? bounds.width : bounds.height;
  });
  const setSizes = (container, axis, sizes) => {
    const property = axis === 'column' ? 'gridTemplateColumns' : 'gridTemplateRows';
    container.style[property] = sizes.map((size) => `${Math.max(1, size)}fr`).join(' ');
  };
  const getMinimums = (container, axis, tracks) => {
    if (axis === 'column') return columnMinimums;
    const columnIndex = columns.indexOf(container);
    return columnRowsMinimums[columnIndex].slice(0, tracks.length);
  };
  const getMaximumRatios = (axis, tracks) => axis === 'column'
    ? columnMaximumRatios
    : tracks.map(() => rowMaximumRatio);

  const fitSizes = (weights, minimums, maximumRatios) => {
    const total = weights.reduce((sum, size) => sum + size, 0);
    if (!total) return weights;
    const minimumTotal = minimums.reduce((sum, size) => sum + size, 0);
    const minimumScale = Math.min(1, total / minimumTotal);
    const scaledMinimums = minimums.map((size) => size * minimumScale);
    const maximums = maximumRatios.map((ratio, index) => Math.max(scaledMinimums[index], total * ratio));
    const sizes = Array(weights.length).fill(0);
    let remaining = total;
    let open = weights.map((_, index) => index);

    while (open.length) {
      const weightTotal = open.reduce((sum, index) => sum + Math.max(0, weights[index]), 0) || open.length;
      let cappedIndex = -1;
      let cappedSize = 0;
      for (const index of open) {
        const weight = Math.max(0, weights[index]) || (weightTotal === open.length ? 1 : 0);
        const proposed = remaining * weight / weightTotal;
        if (proposed < scaledMinimums[index] || proposed > maximums[index]) {
          cappedIndex = index;
          cappedSize = proposed < scaledMinimums[index] ? scaledMinimums[index] : maximums[index];
          break;
        }
      }
      if (cappedIndex < 0) {
        open.forEach((index) => {
          const weight = Math.max(0, weights[index]) || (weightTotal === open.length ? 1 : 0);
          sizes[index] = remaining * weight / weightTotal;
        });
        break;
      }
      sizes[cappedIndex] = cappedSize;
      remaining -= cappedSize;
      open = open.filter((index) => index !== cappedIndex);
    }

    sizes[sizes.length - 1] += total - sizes.reduce((sum, size) => sum + size, 0);
    return sizes;
  };

  const makeHandle = (axis, index, container) => {
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = `layout-resizer layout-resizer-${axis}`;
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', axis === 'column' ? 'vertical' : 'horizontal');
    handle.setAttribute('aria-label', axis === 'column' ? 'Spaltenbreite ändern' : 'Containerhöhe ändern');
    handle.dataset.axis = axis;
    handle.dataset.index = String(index);
    container.appendChild(handle);
    return handle;
  };

  const columnHandles = columns.slice(0, -1).map((_, index) => makeHandle('column', index, workspace));
  const rowHandles = columns.map((column) => getTracks(column, 'row').slice(0, -1)
    .map((_, index) => makeHandle('row', index, column)));

  const positionHandles = () => {
    const workspaceBounds = workspace.getBoundingClientRect();
    columnHandles.forEach((handle, index) => {
      const leftBounds = columns[index].getBoundingClientRect();
      const rightBounds = columns[index + 1].getBoundingClientRect();
      handle.style.left = `${(leftBounds.right + rightBounds.left) / 2 - workspaceBounds.left}px`;
      handle.style.top = `${leftBounds.top - workspaceBounds.top}px`;
      handle.style.height = `${leftBounds.height}px`;
    });
    columns.forEach((column, columnIndex) => {
      const panels = getTracks(column, 'row');
      const columnBounds = column.getBoundingClientRect();
      rowHandles[columnIndex].forEach((handle, index) => {
        const upperBounds = panels[index].getBoundingClientRect();
        const lowerBounds = panels[index + 1].getBoundingClientRect();
        handle.style.left = '0px';
        handle.style.width = `${column.clientWidth}px`;
        handle.style.top = `${(upperBounds.bottom + lowerBounds.top) / 2 - columnBounds.top}px`;
      });
    });
  };

  const resizePair = (handle, delta, startingSizes = null) => {
    const axis = handle.dataset.axis;
    const container = axis === 'column' ? workspace : handle.parentElement;
    const tracks = getTracks(container, axis);
    const sizes = startingSizes ? [...startingSizes] : getSizes(tracks, axis);
    const index = Number(handle.dataset.index);
    const total = sizes.reduce((sum, size) => sum + size, 0);
    const pairTotal = sizes[index] + sizes[index + 1];
    const minimums = getMinimums(container, axis, tracks);
    const minimumScale = Math.min(1, total / minimums.reduce((sum, size) => sum + size, 0));
    const firstMinimum = minimums[index] * minimumScale;
    const secondMinimum = minimums[index + 1] * minimumScale;
    const maximumRatios = getMaximumRatios(axis, tracks);
    const firstMaximum = Math.max(firstMinimum, total * maximumRatios[index]);
    const secondMaximum = Math.max(secondMinimum, total * maximumRatios[index + 1]);
    const pairMinimumScale = Math.min(1, pairTotal / (firstMinimum + secondMinimum));
    const minimumPosition = Math.max(
      firstMinimum * pairMinimumScale,
      pairTotal - secondMaximum,
    );
    const maximumPosition = Math.min(
      firstMaximum,
      pairTotal - secondMinimum * pairMinimumScale,
    );
    const firstSize = Math.max(minimumPosition, Math.min(maximumPosition, sizes[index] + delta));
    sizes[index] = firstSize;
    sizes[index + 1] = pairTotal - firstSize;
    setSizes(container, axis, sizes);
    handle.setAttribute('aria-valuenow', String(Math.round(firstSize)));
    handle.setAttribute('aria-valuemin', String(Math.round(minimumPosition)));
    handle.setAttribute('aria-valuemax', String(Math.round(maximumPosition)));
    positionHandles();
  };

  const attachHandleEvents = (handle) => {
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const axis = handle.dataset.axis;
      const container = axis === 'column' ? workspace : handle.parentElement;
      const tracks = getTracks(container, axis);
      drag = {
        handle,
        pointerId: event.pointerId,
        startPosition: axis === 'column' ? event.clientX : event.clientY,
        startSizes: getSizes(tracks, axis),
        axis,
      };
      document.body.classList.add(axis === 'column' ? 'is-resizing-columns' : 'is-resizing-rows');
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', (event) => {
      if (!drag || drag.handle !== handle || drag.pointerId !== event.pointerId) return;
      const position = drag.axis === 'column' ? event.clientX : event.clientY;
      resizePair(handle, position - drag.startPosition, drag.startSizes);
    });
    const endDrag = (event) => {
      if (!drag || drag.handle !== handle || drag.pointerId !== event.pointerId) return;
      document.body.classList.remove('is-resizing-columns', 'is-resizing-rows');
      drag = null;
      positionHandles();
    };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
    handle.addEventListener('keydown', (event) => {
      const axis = handle.dataset.axis;
      const negativeKey = axis === 'column' ? 'ArrowLeft' : 'ArrowUp';
      const positiveKey = axis === 'column' ? 'ArrowRight' : 'ArrowDown';
      if (event.key !== negativeKey && event.key !== positiveKey) return;
      event.preventDefault();
      const step = event.shiftKey ? 40 : 16;
      resizePair(handle, event.key === negativeKey ? -step : step);
    });
  };

  [...columnHandles, ...rowHandles.flat()].forEach(attachHandleEvents);

  const normalizeLayout = () => {
    if (!narrowScreen()) {
      setSizes(workspace, 'column', fitSizes(
        getSizes(columns, 'column'), columnMinimums, columnMaximumRatios,
      ));
    } else workspace.style.gridTemplateColumns = '';
    columns.forEach((column, index) => {
      const panels = getTracks(column, 'row');
      setSizes(column, 'row', fitSizes(
        getSizes(panels, 'row'), columnRowsMinimums[index].slice(0, panels.length),
        panels.map(() => rowMaximumRatio),
      ));
    });
    positionHandles();
  };

  window.addEventListener('resize', normalizeLayout);
  normalizeLayout();
})();