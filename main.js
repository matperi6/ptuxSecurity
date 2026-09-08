(() => {
  const mapSvg = document.querySelector('#world-map');
  const mapViewport = document.querySelector('#map-viewport');
  const countryLayer = document.querySelector('#country-layer');
  const cityLayer = document.querySelector('#city-layer');
  const routeLayer = document.querySelector('#route-layer');
  const mapStatus = document.querySelector('#map-status');
  const cityTooltip = document.querySelector('#city-tooltip');
  const mapState = { zoom: 0, panX: 0, panY: 0, dragging: false, lastX: 0, lastY: 0 };
  let cities = [];
  const cityPopulationForZoom = (zoom) => {
    const points = [[0, 10000000], [5, 5000000], [10, 1000000], [15, 500000], [25, 100000], [35, 50000], [45, 25000], [50, 25000]];
    const boundedZoom = Math.max(0, Math.min(50, zoom));
    for (let index = 1; index < points.length; index += 1) {
      const [nextZoom, nextPopulation] = points[index];
      if (boundedZoom <= nextZoom) {
        const [previousZoom, previousPopulation] = points[index - 1];
        const progress = (boundedZoom - previousZoom) / (nextZoom - previousZoom);
        return Math.round(Math.exp(Math.log(previousPopulation) + (Math.log(nextPopulation) - Math.log(previousPopulation)) * progress));
      }
    }
    return 25000;
  };
  const mapScale = () => 50 ** (mapState.zoom / 50);
  const lowerBoundLatitude = (items, latitude) => {
    let low = 0;
    let high = items.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (items[middle].lat < latitude) low = middle + 1;
      else high = middle;
    }
    return low;
  };
  const visibleCityCandidates = () => {
    const scale = mapScale();
    const left = 500 + (0 - 500 - mapState.panX) / scale;
    const right = 500 + (1000 - 500 - mapState.panX) / scale;
    const top = 280 + (0 - 280 - mapState.panY) / scale;
    const bottom = 280 + (560 - 280 - mapState.panY) / scale;
    const margin = 8 / scale;
    const minimumLatitude = (280 - bottom) * 180 / 560 - margin;
    const maximumLatitude = (280 - top) * 180 / 560 + margin;
    const minimumX = left - margin;
    const maximumX = right + margin;
    const minimumY = top - margin;
    const maximumY = bottom + margin;
    const start = lowerBoundLatitude(cities, minimumLatitude);
    const end = lowerBoundLatitude(cities, maximumLatitude);
    return cities.slice(start, end + 1).filter(({ population, lon, lat }) => {
      if (population < cityPopulationForZoom(mapState.zoom)) return false;
      const [x, y] = project(lon, lat);
      return x >= minimumX && x <= maximumX && y >= minimumY && y <= maximumY;
    });
  };
  const targetPlaces = [
    ['Reykjavik, IS', -21.94, 64.15], ['Toronto, CA', -79.38, 43.65], ['Tokyo, JP', 139.69, 35.68],
    ['Singapore, SG', 103.82, 1.35], ['Cape Town, ZA', 18.42, -33.93], ['São Paulo, BR', -46.63, -23.55],
  ];
  const project = (longitude, latitude) => [500 + longitude * (1000 / 360), 280 - latitude * (560 / 180)];
  const svgNode = (name, attrs = {}) => { const node = document.createElementNS('http://www.w3.org/2000/svg', name); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value)); return node; };
  const geometryPath = (geometry) => {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    return polygons.map((polygon) => polygon.map((ring) => ring.map(([longitude, latitude], index) => { const [x, y] = project(longitude, latitude); return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`; }).join(' ') + ' Z').join(' ')).join(' ');
  };
  const drawFeatures = (layer, features, className) => {
    layer.replaceChildren();
    features.forEach(({ geometry }) => { if (!geometry) return; layer.appendChild(svgNode('path', { d: geometryPath(geometry), class: className })); });
  };
  const drawCities = () => {
    cityLayer.replaceChildren();
    if (!cities.length) return;
    const visibleCities = visibleCityCandidates();
    const markerFragment = document.createDocumentFragment();
    visibleCities.forEach(({ name, country, lon, lat }) => {
      const [x, y] = project(lon, lat);
      const group = svgNode('g', { class: 'city-marker', role: 'button', tabindex: '0', 'aria-label': `${name}, ${country}` });
      group.appendChild(svgNode('circle', { cx: x, cy: y, r: 2.8 / mapScale() }));
      const showTooltip = (event) => {
        event.stopPropagation();
        const bounds = mapSvg.getBoundingClientRect();
        cityTooltip.textContent = `${name}, ${country}`;
        cityTooltip.style.left = `${event.clientX - bounds.left + 12}px`;
        cityTooltip.style.top = `${event.clientY - bounds.top - 12}px`;
        cityTooltip.hidden = false;
      };
      group.addEventListener('click', showTooltip);
      group.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') showTooltip(event); });
      markerFragment.appendChild(group);
    });
    cityLayer.appendChild(markerFragment);
  };
  const updateMapTransform = () => { const scale = mapScale(); const mapTransform = `translate(${mapState.panX} ${mapState.panY}) translate(500 280) scale(${scale}) translate(-500 -280)`; mapViewport.setAttribute('transform', mapTransform); drawCities(); };
  const drawRoute = (target) => {
    routeLayer.replaceChildren();
    const route = [['Westerstede', 8.11, 53.26], ['Frankfurt DE-CIX', 8.68, 50.11], ['London LINX', -0.12, 51.51], target];
    const points = route.map(([, longitude, latitude]) => project(longitude, latitude));
    routeLayer.appendChild(svgNode('polyline', { points: points.map(([x, y]) => `${x},${y}`).join(' '), class: 'route-line' }));
    route.forEach(([name, longitude, latitude], index) => { const [x, y] = project(longitude, latitude); const group = svgNode('g', { class: `route-node ${index === route.length - 1 ? 'route-target' : ''}` }); group.appendChild(svgNode('circle', { cx: x, cy: y, r: index === route.length - 1 ? 5 : 3.5 })); const label = svgNode('text', { x: x + 8, y: y - 8 }); label.textContent = name; group.appendChild(label); routeLayer.appendChild(group); });
  };
  const loadMap = async () => {
    try {
      const [countries, cityData] = await Promise.all([fetch('map-data/countries-110m.geojson').then((response) => response.json()), fetch('map-data/worldcities.json').then((response) => response.json())]);
      cities = cityData.sort((first, second) => first.lat - second.lat);
      drawFeatures(countryLayer, countries.features, 'country-border');
      updateMapTransform();
      mapStatus.textContent = `${countries.features.length} countries / cities >= ${cityPopulationForZoom(mapState.zoom).toLocaleString('de-DE')} / zoom ${mapState.zoom.toFixed(1)}x`;
    } catch (error) { mapStatus.textContent = 'local map data unavailable'; }
  };
  const svgPointFromEvent = (event) => { const bounds = mapSvg.getBoundingClientRect(); return [(event.clientX - bounds.left) * (1000 / bounds.width), (event.clientY - bounds.top) * (560 / bounds.height)]; };
  const setZoom = (value, focalPoint = [500, 280]) => {
    const previousScale = mapScale();
    mapState.zoom = Math.max(0, Math.min(50, value));
    const nextScale = mapScale();
    const [focalX, focalY] = focalPoint;
    mapState.panX = focalX - 500 - ((focalX - 500 - mapState.panX) / previousScale) * nextScale;
    mapState.panY = focalY - 280 - ((focalY - 280 - mapState.panY) / previousScale) * nextScale;
    updateMapTransform();
    mapStatus.textContent = `offline boundaries / cities >= ${cityPopulationForZoom(mapState.zoom).toLocaleString('de-DE')} / zoom ${mapState.zoom.toFixed(1)}x`;
  };
  document.querySelector('#zoom-in').addEventListener('click', () => setZoom(mapState.zoom + 2));
  document.querySelector('#zoom-out').addEventListener('click', () => setZoom(mapState.zoom - 2));
  document.querySelector('#zoom-reset').addEventListener('click', () => { mapState.panX = 0; mapState.panY = 0; setZoom(0); });
  mapSvg.addEventListener('wheel', (event) => { event.preventDefault(); const focalPoint = svgPointFromEvent(event); const step = Math.max(2, Math.min(8, Math.abs(event.deltaY) / 40)); setZoom(mapState.zoom + (event.deltaY < 0 ? step : -step), focalPoint); }, { passive: false });
  mapSvg.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.city-marker')) return;
    cityTooltip.hidden = true;
    mapState.dragging = true;
    mapState.lastX = event.clientX;
    mapState.lastY = event.clientY;
    mapSvg.setPointerCapture(event.pointerId);
  });
  mapSvg.addEventListener('pointermove', (event) => { if (!mapState.dragging) return; const bounds = mapSvg.getBoundingClientRect(); mapState.panX += (event.clientX - mapState.lastX) * (1000 / bounds.width); mapState.panY += (event.clientY - mapState.lastY) * (560 / bounds.height); mapState.lastX = event.clientX; mapState.lastY = event.clientY; updateMapTransform(); });
  mapSvg.addEventListener('pointerup', () => { mapState.dragging = false; });
  loadMap();

  const terminalWindow = document.querySelector('#terminal-window');
  const terminalStage = document.querySelector('.terminal-stage');
  const terminalDragHandle = document.querySelector('#terminal-drag-handle');
  const terminalPosition = { dragging: false, offsetX: 0, offsetY: 0 };
  terminalDragHandle.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    const bounds = terminalStage.getBoundingClientRect();
    terminalPosition.dragging = true;
    terminalPosition.offsetX = event.clientX - bounds.left;
    terminalPosition.offsetY = event.clientY - bounds.top;
    terminalStage.style.position = 'fixed';
    terminalStage.style.left = `${bounds.left}px`;
    terminalStage.style.top = `${bounds.top}px`;
    terminalStage.style.right = 'auto';
    terminalDragHandle.setPointerCapture(event.pointerId);
  });
  terminalDragHandle.addEventListener('pointermove', (event) => {
    if (!terminalPosition.dragging) return;
    const maxLeft = Math.max(0, window.innerWidth - terminalStage.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - terminalStage.offsetHeight);
    terminalStage.style.left = `${Math.max(0, Math.min(maxLeft, event.clientX - terminalPosition.offsetX))}px`;
    terminalStage.style.top = `${Math.max(0, Math.min(maxTop, event.clientY - terminalPosition.offsetY))}px`;
  });
  terminalDragHandle.addEventListener('pointerup', () => { terminalPosition.dragging = false; });

  const terminal = new Terminal({
    allowProposedApi: true,
    convertEol: true,
    cursorBlink: true,
    fontFamily: 'DM Mono, SFMono-Regular, Consolas, monospace',
    fontSize: 14,
    lineHeight: 1.35,
    scrollback: 1200,
    theme: {
      background: '#0d1111',
      foreground: '#d8ded2',
      cursor: '#b4d36b',
      cursorAccent: '#0d1111',
      selectionBackground: 'rgba(180, 211, 107, 0.25)',
      black: '#0d1111',
      brightBlack: '#626b66',
      green: '#b4d36b',
      brightGreen: '#d7f28e',
      yellow: '#e4c27a',
      blue: '#78c5c8',
      magenta: '#c6a8cf',
      cyan: '#78c5c8',
      white: '#d8ded2',
    },
  });
  const fitAddon = new FitAddon.FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(document.querySelector('#terminal'));

  const colors = {
    green: '\x1b[38;2;180;211;107m',
    brightGreen: '\x1b[38;2;215;242;142m',
    orange: '\x1b[38;2;242;155;96m',
    blue: '\x1b[38;2;120;197;200m',
    muted: '\x1b[38;2;143;152;145m',
    dim: '\x1b[38;2;98;107;102m',
    reset: '\x1b[0m',
  };

  const fileSystem = {
    type: 'dir',
    entries: {
      bin: { type: 'dir', entries: {} },
      dev: { type: 'dir', entries: { null: { type: 'file', content: '' }, random: { type: 'file', content: '' } } },
      etc: {
        type: 'dir',
        entries: {
          hostname: { type: 'file', content: 'ptux' },
          motd: { type: 'file', content: 'Welcome to ptux Linux 1.0 (browser build)' },
          'os-release': { type: 'file', content: 'NAME="ptux Linux"\nVERSION="1.0 (Browser Edition)"\nID=ptux' },
        },
      },
      home: {
        type: 'dir',
        entries: {
          guest: {
            type: 'dir',
            entries: {
              'readme.txt': { type: 'file', content: 'This is your local playground.\nNothing here leaves your browser.\nTry: help, ls, cd, cat, mkdir, touch.' },
              desktop: { type: 'dir', entries: {} },
              documents: { type: 'dir', entries: {} },
              downloads: { type: 'dir', entries: {} },
            },
          },
        },
      },
      tmp: { type: 'dir', entries: {} },
      usr: { type: 'dir', entries: { bin: { type: 'dir', entries: {} }, share: { type: 'dir', entries: {} } } },
    },
  };

  const commandNames = ['cat', 'cd', 'clear', 'date', 'echo', 'exit', 'help', 'history', 'hostname', 'ls', 'man', 'mkdir', 'neofetch', 'pwd', 'rm', 'touch', 'tracert', 'uname', 'whoami', 'which'];
  const initialFileSystem = JSON.stringify(fileSystem);
  let currentDirectory = '/home/guest';
  let input = '';
  let history = [];
  let historyIndex = 0;

  const promptPath = () => {
    if (currentDirectory === '/home/guest') return '~';
    if (currentDirectory.startsWith('/home/guest/')) return `~/${currentDirectory.slice('/home/guest/'.length)}`;
    return currentDirectory;
  };

  const prompt = () => `${colors.green}guest${colors.reset}@${colors.blue}ptux${colors.reset}:${colors.brightGreen}${promptPath()}${colors.reset}$ `;
  const writePrompt = () => terminal.write(`\r\n${prompt()}`);
  const print = (text = '') => text.split('\n').forEach((line) => terminal.writeln(line));

  function resolvePath(path = '~') {
    let target = path;
    if (target === '~' || target.startsWith('~/')) target = `/home/guest${target.slice(1)}`;
    else if (!target.startsWith('/')) target = `${currentDirectory}/${target}`;
    const parts = target.split('/');
    const normalized = [];
    parts.forEach((part) => {
      if (!part || part === '.') return;
      if (part === '..') normalized.pop();
      else normalized.push(part);
    });
    return `/${normalized.join('/')}` || '/';
  }

  function getNode(path) {
    if (path === '/') return fileSystem;
    return resolvePath(path).split('/').filter(Boolean).reduce((node, part) => node?.type === 'dir' ? node.entries[part] : undefined, fileSystem);
  }

  function getParent(path) {
    const normalized = resolvePath(path);
    const lastSlash = normalized.lastIndexOf('/');
    return { parent: getNode(normalized.slice(0, lastSlash) || '/'), name: normalized.slice(lastSlash + 1) };
  }

  function parseArgs(value) {
    return (value.match(/"[^"\\]*(?:\\.[^"\\]*)*"|'[^']*'|\S+/g) || []).map((part) => {
      if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) return part.slice(1, -1);
      return part;
    });
  }

  function listDirectory(path, showAll, longFormat) {
    const node = getNode(path);
    if (!node) return `${colors.orange}ls: cannot access '${path}': No such file or directory${colors.reset}`;
    if (node.type !== 'dir') return longFormat ? `-rw-r--r--  1 guest guest  ${node.content.length.toString().padStart(4, ' ')}  ${path}` : path;
    const entries = Object.keys(node.entries).sort();
    const visible = showAll ? ['.', '..', ...entries] : entries;
    if (!longFormat) return visible.map((entry) => node.entries[entry]?.type === 'dir' ? `${colors.blue}${entry}/${colors.reset}` : entry).join('  ');
    return visible.map((entry) => {
      if (entry === '.') return 'drwxr-xr-x  4 guest guest  4096  .';
      if (entry === '..') return 'drwxr-xr-x  4 guest guest  4096  ..';
      const child = node.entries[entry];
      const mode = child.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
      const size = child.type === 'file' ? child.content.length : 4096;
      const styledName = child.type === 'dir' ? `${colors.blue}${entry}${colors.reset}` : entry;
      return `${mode}  1 guest guest  ${size.toString().padStart(4, ' ')}  ${styledName}`;
    }).join('\n');
  }

  function execute(commandLine) {
    const args = parseArgs(commandLine);
    const command = args.shift();
    if (!command) return;
    if (command === 'clear') { terminal.clear(); return; }
    if (command === 'help') {
      print(`${colors.brightGreen}ptux shell${colors.reset} ${colors.dim}:: available commands${colors.reset}`);
      print('');
      print(`  ${colors.green}help${colors.reset}       show this command list`);
      print(`  ${colors.green}ls${colors.reset}         list directory contents`);
      print(`  ${colors.green}cd${colors.reset}         change directory`);
      print(`  ${colors.green}pwd${colors.reset}        print working directory`);
      print(`  ${colors.green}cat${colors.reset}        print file contents`);
      print(`  ${colors.green}touch${colors.reset}      create an empty file`);
      print(`  ${colors.green}mkdir${colors.reset}      create a directory`);
      print(`  ${colors.green}rm${colors.reset}         remove a file or directory`);
      print(`  ${colors.green}echo${colors.reset}        print text`);
      print(`  ${colors.green}date${colors.reset}        show local date and time`);
      print(`  ${colors.green}whoami${colors.reset}      print current user`);
      print(`  ${colors.green}uname${colors.reset}       print system information`);
      print(`  ${colors.green}neofetch${colors.reset}    show system summary`);
      print(`  ${colors.green}history${colors.reset}     show command history`);
      print(`  ${colors.green}man${colors.reset}         open a compact manual`);
      return;
    }
    if (command === 'pwd') { print(currentDirectory); return; }
    if (command === 'whoami') { print('guest'); return; }
    if (command === 'hostname') { print('ptux'); return; }
    if (command === 'date') { print(new Date().toString()); return; }
    if (command === 'uname') { print(args.includes('-a') ? 'ptux 1.0.0 browser-kernel #1 SMP Web x86_64 GNU/Linux' : 'ptux'); return; }
    if (command === 'echo') { print(args.join(' ')); return; }
    if (command === 'tracert') {
      if (args[0] !== '132.45.32.231') { print(`${colors.orange}tracert: unknown route target${colors.reset}`); return; }
      const target = targetPlaces[Math.floor(Math.random() * targetPlaces.length)];
      drawRoute(target);
      print(`${colors.blue}Tracing route to ${args[0]} [${target[0]}]${colors.reset}`);
      print(`${colors.dim}via offline IXP topology${colors.reset}`);
      [['Westerstede', '8.11.53.26'], ['Frankfurt DE-CIX', '80.81.192.1'], ['London LINX', '195.66.224.1'], [target[0], args[0]]].forEach(([name, address], index) => print(`  ${index + 1}   ${String(12 + index * 9).padStart(3, ' ')} ms   ${name} (${address})`));
      return;
    }
    if (command === 'ls') {
      const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const longFormat = args.includes('-l') || showAll;
      const path = args.find((arg) => !arg.startsWith('-')) || currentDirectory;
      print(listDirectory(path, showAll, longFormat));
      return;
    }
    if (command === 'cd') {
      const target = args[0] || '~';
      const node = getNode(target);
      if (!node) print(`${colors.orange}bash: cd: ${target}: No such file or directory${colors.reset}`);
      else if (node.type !== 'dir') print(`${colors.orange}bash: cd: ${target}: Not a directory${colors.reset}`);
      else currentDirectory = resolvePath(target);
      return;
    }
    if (command === 'cat') {
      if (!args.length) { print(`${colors.orange}cat: missing file operand${colors.reset}`); return; }
      args.forEach((path) => {
        const node = getNode(path);
        if (!node) print(`${colors.orange}cat: ${path}: No such file or directory${colors.reset}`);
        else if (node.type === 'dir') print(`${colors.orange}cat: ${path}: Is a directory${colors.reset}`);
        else print(node.content);
      });
      return;
    }
    if (command === 'touch' || command === 'mkdir') {
      if (!args.length) { print(`${colors.orange}${command}: missing operand${colors.reset}`); return; }
      args.filter((arg) => !arg.startsWith('-')).forEach((path) => {
        const { parent, name } = getParent(path);
        if (!parent || parent.type !== 'dir') print(`${colors.orange}${command}: cannot create '${path}'${colors.reset}`);
        else if (parent.entries[name]) print(`${colors.orange}${command}: '${path}' already exists${colors.reset}`);
        else parent.entries[name] = command === 'mkdir' ? { type: 'dir', entries: {} } : { type: 'file', content: '' };
      });
      return;
    }
    if (command === 'rm') {
      const recursive = args.includes('-r') || args.includes('-rf');
      const targets = args.filter((arg) => !arg.startsWith('-'));
      if (!targets.length) { print(`${colors.orange}rm: missing operand${colors.reset}`); return; }
      targets.forEach((path) => {
        const { parent, name } = getParent(path);
        const node = parent?.entries?.[name];
        if (!node) print(`${colors.orange}rm: cannot remove '${path}': No such file or directory${colors.reset}`);
        else if (node.type === 'dir' && !recursive) print(`${colors.orange}rm: cannot remove '${path}': Is a directory${colors.reset}`);
        else delete parent.entries[name];
      });
      return;
    }
    if (command === 'history') { history.forEach((item, index) => print(`  ${(index + 1).toString().padStart(3, ' ')}  ${item}`)); return; }
    if (command === 'which') { print(args[0] ? `/usr/bin/${args[0]}` : `${colors.orange}which: missing argument${colors.reset}`); return; }
    if (command === 'man') { print(`${colors.green}Manual: ${args[0] || 'ptux'}${colors.reset}\nTry ${colors.brightGreen}help${colors.reset} for supported commands. This is a browser shell, not a real system.`); return; }
    if (command === 'neofetch') {
      print(`${colors.green}        .--.       ${colors.brightGreen}guest@ptux${colors.reset}`);
      print(`${colors.green}       |o_o |      ${colors.dim}----------------${colors.reset}`);
      print(`${colors.green}       |:_/ |      ${colors.blue}OS${colors.reset}: ptux Linux 1.0`);
      print(`${colors.green}      //   \\ \\     ${colors.blue}Host${colors.reset}: Browser`);
      print(`${colors.green}     (|     | )    ${colors.blue}Shell${colors.reset}: bash-like`);
      print(`${colors.green}    /'\\_   _/\\\\    ${colors.blue}Term${colors.reset}: xterm.js`);
      print(`${colors.green}    \\___)=(___/    ${colors.blue}Mode${colors.reset}: ${colors.brightGreen}offline${colors.reset}`);
      return;
    }
    if (command === 'exit') { print(`${colors.dim}logout${colors.reset}\n${colors.green}Session kept open. Type ${colors.brightGreen}help${colors.reset} to continue.${colors.reset}`); return; }
    print(`${colors.orange}bash: ${command}: command not found${colors.reset}`);
  }

  function redrawInput(value = input) {
    terminal.write(`\r\x1b[2K${prompt()}${value}`);
  }

  function submit() {
    const commandLine = input.trim();
    terminal.write('\r\n');
    if (commandLine) {
      history = history.filter((item) => item !== commandLine);
      history.push(commandLine);
      historyIndex = history.length;
      execute(commandLine);
    }
    input = '';
    writePrompt();
  }

  function autocomplete() {
    const parts = input.split(/\s+/);
    if (parts.length === 1) {
      const matches = commandNames.filter((name) => name.startsWith(input));
      if (matches.length === 1) { input = matches[0] + ' '; redrawInput(); }
      else if (matches.length > 1) { terminal.write('\r\n' + matches.join('  ')); writePrompt(); terminal.write(input); }
      return;
    }
    const partial = parts.pop();
    const base = parts.join(' ');
    const node = getNode(parts.length > 0 ? parts[parts.length - 1] || '.' : currentDirectory);
    const matches = node?.type === 'dir' ? Object.keys(node.entries).filter((name) => name.startsWith(partial)) : [];
    if (matches.length === 1) { input = `${base}${base ? ' ' : ''}${matches[0]}${node.entries[matches[0]].type === 'dir' ? '/' : ' '}`; redrawInput(); }
  }

  terminal.onData((data) => {
    if (data === '\r') { submit(); return; }
    if (data === '\u0003') { terminal.write('^C'); input = ''; writePrompt(); return; }
    if (data === '\u0004') { if (!input) { terminal.write('^D'); writePrompt(); } return; }
    if (data === '\u007f') { if (input.length) { input = input.slice(0, -1); terminal.write('\b \b'); } return; }
    if (data === '\t') { autocomplete(); return; }
    if (data === '\u001b[A') { historyIndex = Math.max(0, historyIndex - 1); input = history[historyIndex] || ''; redrawInput(); return; }
    if (data === '\u001b[B') { historyIndex = Math.min(history.length, historyIndex + 1); input = history[historyIndex] || ''; redrawInput(); return; }
    if (data === '\u001b[C' || data === '\u001b[D') return;
    if (!data.includes('\u001b')) { input += data.replace(/[\r\n]/g, ''); terminal.write(data.replace(/[\r\n]/g, '')); }
  });

  function reset() {
    Object.keys(fileSystem.entries).forEach((key) => delete fileSystem.entries[key]);
    Object.assign(fileSystem, JSON.parse(initialFileSystem));
    currentDirectory = '/home/guest';
    input = '';
    history = [];
    historyIndex = 0;
    terminal.clear();
    boot();
  }

  function boot() {
    terminal.write(`${colors.green}ptux${colors.reset} ${colors.dim}// browser shell${colors.reset}\r\n`);
    terminal.write(`${colors.dim}Linux-like environment ready. No network. No root. Just a prompt.${colors.reset}\r\n\r\n`);
    terminal.write(prompt());
  }

  document.querySelectorAll('[data-command]').forEach((button) => button.addEventListener('click', () => {
    input = button.dataset.command;
    redrawInput();
    submit();
    terminal.focus();
  }));
  document.querySelector('#reset-terminal').addEventListener('click', reset);
  window.addEventListener('resize', () => fitAddon.fit());
  fitAddon.fit();
  boot();
})();
