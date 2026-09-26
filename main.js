(() => {
  const mapSvg = document.querySelector('#world-map');
  const mapViewport = document.querySelector('#map-viewport');
  const countryLayer = document.querySelector('#country-layer');
  const routeLayer = document.querySelector('#route-layer');
  const attackLayer = document.querySelector('#attack-layer');
  const serverLayer = document.querySelector('#server-layer');
  const serverInfo = document.querySelector('#server-info');
  const codeOutput = document.querySelector('#code-output');
  const aiOutput = document.querySelector('#ai-output');
  const monitorOutput = document.querySelector('#monitor-output');
  const blockedLogs = document.querySelector('#blocked-logs');
  const firewallStatus = document.querySelector('#firewall-status');
  const fail2banStatus = document.querySelector('#fail2ban-status');
  const mapState = { zoom: 0, panX: 0, panY: 0, dragging: false, lastX: 0, lastY: 0 };
  const serverStorageKey = 'ptuxSecurity.servers';
  const historyStorageKey = 'ptuxSecurity.history';
  const infoSafeStorageKey = 'ptuxSecurity.infoSafe';
  const osImagesStorageKey = 'ptuxSecurity.osImages';
  const availableDatacentersStorageKey = 'ptuxSecurity.availableDatacenters';
  const availableOsImages = ['ptuXOS'];
  const deutsche_rechenzentren = [
    { name: 'Frankfurt', lon: 8.68213, lat: 50.11092 },
    { name: 'Berlin', lon: 13.41053, lat: 52.52437 },
    { name: 'Hamburg', lon: 9.99302, lat: 53.55073 },
    { name: 'München', lon: 11.57549, lat: 48.13743 },
    { name: 'Düsseldorf', lon: 6.77927, lat: 51.22319 },
    { name: 'Köln', lon: 6.95, lat: 50.93333 },
    { name: 'Leipzig', lon: 12.37129, lat: 51.33962 },
    { name: 'Nürnberg', lon: 11.07752, lat: 49.45421 },
    { name: 'Stuttgart', lon: 9.17702, lat: 48.78232 },
    { name: 'Hannover', lon: 9.73322, lat: 52.37052 },
  ];
  const datacenterIps = [
    ['45.83.12.10', '45.83.12.11'], ['46.101.22.20', '46.101.22.21'],
    ['51.68.33.30', '51.68.33.31'], ['80.158.44.40', '80.158.44.41'],
    ['91.65.55.50', '91.65.55.51'], ['138.201.66.60', '138.201.66.61'],
    ['176.9.77.70', '176.9.77.71'], ['185.12.88.80', '185.12.88.81'],
    ['193.175.99.90', '193.175.99.91'], ['212.201.110.100', '212.201.110.101'],
  ];
  let cityData = [];
  let installedServers = [];
  let availableDatacenters = [];
  const installationTimers = new Set();
  const attackTimers = new Map();
  const attackFlashTimers = new Set();
  let mapDataReady;
  const mapScale = () => 50 ** (mapState.zoom / 50);
  const attackColors = [
    '#ff6b6b', '#4dd0e1', '#c6e05b', '#ffb74d', '#ce93d8',
    '#64b5f6', '#a5d6a7', '#f06292', '#fff176', '#80cbc4',
    '#ff8a65', '#b39ddb', '#aed581', '#4fc3f7', '#e57373',
    '#dce775', '#ba68c8', '#81d4fa', '#ffcc80', '#f48fb1',
  ];
  const targetPlaces = [
    ['Reykjavik, IS', -21.94, 64.15], ['Toronto, CA', -79.38, 43.65], ['Tokyo, JP', 139.69, 35.68],
    ['Singapore, SG', 103.82, 1.35], ['Cape Town, ZA', 18.42, -33.93], ['São Paulo, BR', -46.63, -23.55],
  ];
  const attackerOrigins = [
    { city: 'Moskau, Russland', lon: 37.6173, lat: 55.7558, prefix: '5.8' },
    { city: 'Sankt Petersburg, Russland', lon: 30.3351, lat: 59.9343, prefix: '31.173' },
    { city: 'Nowosibirsk, Russland', lon: 82.9204, lat: 55.0302, prefix: '46.17' },
    { city: 'Kasan, Russland', lon: 49.1064, lat: 55.7961, prefix: '178.208' },
    { city: 'Jekaterinburg, Russland', lon: 60.5975, lat: 56.8389, prefix: '95.161' },
    { city: 'Krasnojarsk, Russland', lon: 92.8526, lat: 56.0153, prefix: '109.106' },
    { city: 'Wladiwostok, Russland', lon: 131.8855, lat: 43.1155, prefix: '212.107' },
    { city: 'Rostow am Don, Russland', lon: 39.7015, lat: 47.2357, prefix: '176.213' },
    { city: 'Peking, China', lon: 116.4074, lat: 39.9042, prefix: '39.156' },
    { city: 'Shanghai, China', lon: 121.4737, lat: 31.2304, prefix: '110.52' },
    { city: 'Chengdu, China', lon: 104.0668, lat: 30.5728, prefix: '114.114' },
    { city: 'Guangzhou, China', lon: 113.2644, lat: 23.1291, prefix: '223.5' },
    { city: 'Shenzhen, China', lon: 114.0579, lat: 22.5431, prefix: '119.123' },
    { city: 'Hangzhou, China', lon: 120.1551, lat: 30.2741, prefix: '115.236' },
    { city: 'Wuhan, China', lon: 114.3054, lat: 30.5931, prefix: '59.172' },
    { city: 'Chongqing, China', lon: 106.5516, lat: 29.563, prefix: '222.177' },
    { city: 'Xi’an, China', lon: 108.9398, lat: 34.3416, prefix: '113.140' },
    { city: 'Teheran, Iran', lon: 51.389, lat: 35.6892, prefix: '5.160' },
    { city: 'Bagdad, Irak', lon: 44.3661, lat: 33.3152, prefix: '37.238' },
    { city: 'Riad, Saudi-Arabien', lon: 46.6753, lat: 24.7136, prefix: '37.105' },
    { city: 'Dubai, VAE', lon: 55.2708, lat: 25.2048, prefix: '94.200' },
    { city: 'Kabul, Afghanistan', lon: 69.2075, lat: 34.5553, prefix: '103.219' },
    { city: 'Mumbai, Indien', lon: 72.8777, lat: 19.076, prefix: '103.86' },
    { city: 'Delhi, Indien', lon: 77.209, lat: 28.6139, prefix: '103.25' },
    { city: 'Karachi, Pakistan', lon: 67.0011, lat: 24.8607, prefix: '182.176' },
    { city: 'Dhaka, Bangladesch', lon: 90.4125, lat: 23.8103, prefix: '103.230' },
    { city: 'Bangkok, Thailand', lon: 100.5018, lat: 13.7563, prefix: '49.231' },
    { city: 'Jakarta, Indonesien', lon: 106.8456, lat: -6.2088, prefix: '103.28' },
    { city: 'Kuala Lumpur, Malaysia', lon: 101.6869, lat: 3.139, prefix: '175.139' },
    { city: 'Manila, Philippinen', lon: 120.9842, lat: 14.5995, prefix: '120.29' },
    { city: 'Hanoi, Vietnam', lon: 105.8342, lat: 21.0278, prefix: '113.160' },
    { city: 'Seoul, Südkorea', lon: 126.978, lat: 37.5665, prefix: '121.130' },
    { city: 'Nairobi, Kenia', lon: 36.8219, lat: -1.2921, prefix: '41.89' },
    { city: 'Johannesburg, Südafrika', lon: 28.0473, lat: -26.2041, prefix: '197.96' },
    { city: 'Kairo, Ägypten', lon: 31.2357, lat: 30.0444, prefix: '41.33' },
    { city: 'Lagos, Nigeria', lon: 3.3792, lat: 6.5244, prefix: '105.112' },
    { city: 'Addis Abeba, Äthiopien', lon: 38.7578, lat: 8.9806, prefix: '197.156' },
    { city: 'Accra, Ghana', lon: -0.187, lat: 5.6037, prefix: '41.66' },
    { city: 'São Paulo, Brasilien', lon: -46.6333, lat: -23.5505, prefix: '177.92' },
    { city: 'Buenos Aires, Argentinien', lon: -58.3816, lat: -34.6037, prefix: '190.210' },
    { city: 'Lima, Peru', lon: -77.0428, lat: -12.0464, prefix: '181.65' },
    { city: 'Bogotá, Kolumbien', lon: -74.0721, lat: 4.711, prefix: '181.49' },
    { city: 'Santiago, Chile', lon: -70.6693, lat: -33.4489, prefix: '186.67' },
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
  const updateMapTransform = () => { const scale = mapScale(); const mapTransform = `translate(${mapState.panX} ${mapState.panY}) translate(500 280) scale(${scale}) translate(-500 -280)`; mapViewport.setAttribute('transform', mapTransform); drawServerMarkers(); };
  const drawServerMarkers = () => {
    attackLayer.replaceChildren();
    serverLayer.replaceChildren();
    installedServers.forEach((server) => {
      if (!server.datacenter) return;
      const [x, y] = project(server.datacenter.lon, server.datacenter.lat);
      (server.attackers || []).forEach((attacker) => {
        if (!attacker.visible && !attacker.banned) return;
        const [attackerX, attackerY] = project(attacker.lon, attacker.lat);
        if (!attacker.banned) {
          attackLayer.appendChild(svgNode('line', { x1: x, y1: y, x2: attackerX, y2: attackerY, class: `attack-link${attacker.active ? ' attack-link--active' : ''}`, style: `--server-attack-color: ${server.attackColor || attackColors[0]}` }));
        }
        const markerClass = attacker.banned ? 'attacker-marker attacker-marker--banned' : `attacker-marker${attacker.active ? ' attacker-marker--active' : ''}`;
        const markerLabel = attacker.banned ? `${attacker.ip} aus ${attacker.city} dauerhaft gebannt` : `${attacker.ip} aus ${attacker.city} greift ${server.hostname} an`;
        const marker = svgNode('g', { class: markerClass, 'aria-label': markerLabel, style: `--server-attack-color: ${server.attackColor || attackColors[0]}` });
        marker.appendChild(svgNode('circle', { cx: attackerX, cy: attackerY, r: 5 / mapScale() }));
        attackLayer.appendChild(marker);
      });
      const marker = svgNode('g', { class: 'server-marker', 'aria-label': `Serverstandort ${server.hostname} in ${server.datacenter.name}` });
      marker.appendChild(svgNode('circle', { cx: x, cy: y, r: 7 / mapScale() }));
      serverLayer.appendChild(marker);
    });
  };
  const assignServerAttackColors = () => installedServers.forEach((server, index) => {
    server.attackColor ||= attackColors[index % attackColors.length];
  });
  const randomInteger = (minimum, maximum) => Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  const createAttackingComputer = (origin, existingIps = new Set()) => {
    let ip;
    do {
      ip = `${origin.prefix}.${randomInteger(1, 254)}.${randomInteger(1, 254)}`;
    } while (existingIps.has(ip));
    return {
      ip,
      city: origin.city,
      lon: origin.lon,
      lat: origin.lat,
      attempts: 0,
      maxAttempts: 30,
      nextAttackAt: Date.now() + randomInteger(500, 6000),
      visible: false,
      banned: false,
      active: false,
    };
  };
  const generateAttackingComputers = () => {
    const origins = [...attackerOrigins];
    for (let index = origins.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInteger(0, index);
      [origins[index], origins[swapIndex]] = [origins[swapIndex], origins[index]];
    }
    const count = randomInteger(2, 10);
    return origins.slice(0, count).map((origin) => createAttackingComputer(origin));
  };
  const appendMonitorMessage = (message, kind = 'status') => {
    monitorOutput.querySelector('.empty-state')?.remove();
    const line = document.createElement('div');
    line.className = `monitor-line ${kind}`;
    line.textContent = message;
    monitorOutput.appendChild(line);
    monitorOutput.scrollTop = monitorOutput.scrollHeight;
    return line;
  };
  const appendServerMonitorMessage = (server, message, kind, color) => {
    if (!terminalSessions.some((session) => session.hostname === server.hostname)) return;
    const line = appendMonitorMessage(message, kind);
    if (color) line.style.color = color;
  };
  const attackMessageColor = (attempts) => {
    const start = [131, 223, 114];
    const end = [255, 119, 119];
    const progress = Math.max(0, Math.min(1, (attempts - 9) / 16));
    const channels = start.map((value, index) => Math.round(value + (end[index] - value) * progress));
    return `rgb(${channels.join(', ')})`;
  };
  const appendBlockedLog = (server, attacker) => {
    blockedLogs.querySelector('.empty-state')?.remove();
    const entry = document.createElement('div');
    entry.className = 'blocked-log-entry';
    entry.textContent = `${attacker.ip} · ${attacker.city} · ${server.hostname} · fail2ban dauerhaft gebannt`;
    blockedLogs.prepend(entry);
    blockedLogs.scrollTop = 0;
  };
  const renderBlockedLogs = () => {
    blockedLogs.replaceChildren();
    const entries = installedServers.flatMap((server) => (server.attackers || [])
      .filter((attacker) => attacker.banned)
      .map((attacker) => ({ server, attacker }))
    ).sort((left, right) => (left.attacker.bannedAt || 0) - (right.attacker.bannedAt || 0));
    if (!entries.length) {
      const empty = document.createElement('span');
      empty.className = 'empty-state';
      empty.textContent = 'Noch keine IPs geblockt.';
      blockedLogs.appendChild(empty);
      return;
    }
    entries.forEach(({ server, attacker }) => appendBlockedLog(server, attacker));
  };
  const updateSecurityIndicators = (server) => {
    [[firewallStatus, server?.firewallActive], [fail2banStatus, server?.fail2banActive]].forEach(([indicator, active]) => {
      indicator.classList.toggle('is-on', Boolean(active));
      indicator.classList.toggle('is-off', !active);
      indicator.setAttribute('aria-label', active ? 'aktiv' : 'aus');
      indicator.title = active ? 'aktiv' : 'aus';
    });
  };
  const clearMonitorOutput = () => {
    monitorOutput.replaceChildren();
    const empty = document.createElement('span');
    empty.className = 'empty-state';
    empty.textContent = 'Keine aktiven Sicherheitsmeldungen.';
    monitorOutput.appendChild(empty);
  };
  const scheduleAttackerAttempt = (server, attacker, nextAt) => {
    const timerKey = `${server.hostname}:${attacker.ip}`;
    if (attacker.banned || attackTimers.has(timerKey)) return;
    attacker.nextAttackAt = nextAt;
    saveServers();
    const timer = window.setTimeout(() => {
      attackTimers.delete(timerKey);
      const targetServer = installedServers.find((entry) => entry.hostname === server.hostname);
      const currentAttacker = targetServer?.attackers?.find((entry) => entry.ip === attacker.ip);
      if (!targetServer?.firewallActive || !targetServer.fail2banActive || !currentAttacker || currentAttacker.banned) return;
      currentAttacker.visible = true;
      currentAttacker.attempts ??= 0;
      currentAttacker.maxAttempts = 30;
      currentAttacker.attempts += 1;
      currentAttacker.active = true;
      currentAttacker.activeUntil = Date.now() + 600;
      const messageType = currentAttacker.attempts >= 25 ? 'Angriff von' : 'Anfrage an';
      appendServerMonitorMessage(targetServer, `${currentAttacker.ip} aus ${currentAttacker.city}: ${messageType} ${targetServer.hostname} (${currentAttacker.attempts}/${currentAttacker.maxAttempts})`, 'attack', attackMessageColor(currentAttacker.attempts));
      const flashTimer = window.setTimeout(() => {
        attackFlashTimers.delete(flashTimer);
        currentAttacker.active = false;
        drawServerMarkers();
      }, 600);
      attackFlashTimers.add(flashTimer);
      if (currentAttacker.attempts >= currentAttacker.maxAttempts) {
        currentAttacker.banned = true;
        currentAttacker.bannedAt = Date.now();
        currentAttacker.active = false;
        appendServerMonitorMessage(targetServer, `${currentAttacker.ip}: nach ${currentAttacker.attempts} Versuchen dauerhaft durch fail2ban gebannt.`, 'ban');
        appendBlockedLog(targetServer, currentAttacker);
      } else {
        currentAttacker.nextAttackAt = Date.now() + randomInteger(850, 1150);
      }
      saveServers();
      drawServerMarkers();
      if (!currentAttacker.banned) scheduleAttackerAttempt(targetServer, currentAttacker, currentAttacker.nextAttackAt);
    }, Math.max(0, nextAt - Date.now()));
    attackTimers.set(timerKey, timer);
  };
  const scheduleNextAttackerArrival = (server, nextAt) => {
    const timerKey = `${server.hostname}:spawner`;
    if (attackTimers.has(timerKey)) return;
    server.attackerSpawnAt = nextAt;
    saveServers();
    const timer = window.setTimeout(() => {
      attackTimers.delete(timerKey);
      const targetServer = installedServers.find((entry) => entry.hostname === server.hostname);
      if (!targetServer?.firewallActive || !targetServer.fail2banActive) return;
      const existingIps = new Set((targetServer.attackers || []).map((attacker) => attacker.ip));
      const origin = attackerOrigins[randomInteger(0, attackerOrigins.length - 1)];
      const attacker = createAttackingComputer(origin, existingIps);
      attacker.nextAttackAt = Date.now();
      targetServer.attackers.push(attacker);
      targetServer.attackerSpawnAt = Date.now() + randomInteger(10000, 20000);
      saveServers();
      drawServerMarkers();
      scheduleAttackerAttempt(targetServer, attacker, attacker.nextAttackAt);
      scheduleNextAttackerArrival(targetServer, targetServer.attackerSpawnAt);
    }, Math.max(0, nextAt - Date.now()));
    attackTimers.set(timerKey, timer);
  };
  const scheduleAttackSimulation = (server, delay = 3500) => {
    if (server.attackers?.length) {
      server.attackerSpawnAt ??= Date.now() + randomInteger(10000, 20000);
      server.attackers.forEach((attacker) => {
        if (attacker.banned) return;
        attacker.attempts ??= 0;
        attacker.maxAttempts = 30;
        attacker.visible ??= true;
        attacker.nextAttackAt ??= Date.now() + randomInteger(500, 6000);
        scheduleAttackerAttempt(server, attacker, attacker.nextAttackAt);
      });
      scheduleNextAttackerArrival(server, server.attackerSpawnAt);
      return;
    }
    if (attackTimers.has(server.hostname)) return;
    server.attackScheduledAt ??= Date.now() + delay;
    saveServers();
    const timer = window.setTimeout(() => {
      attackTimers.delete(server.hostname);
      const targetServer = installedServers.find((entry) => entry.hostname === server.hostname);
      if (!targetServer?.firewallActive || !targetServer.fail2banActive) return;
      targetServer.attackers = generateAttackingComputers();
      targetServer.attackScheduledAt = null;
      targetServer.attackerSpawnAt = Date.now() + randomInteger(10000, 20000);
      saveServers();
      drawServerMarkers();
      scheduleAttackSimulation(targetServer);
    }, Math.max(0, server.attackScheduledAt - Date.now()));
    attackTimers.set(server.hostname, timer);
  };
  const resumePendingAttackSimulations = () => {
    installedServers.filter((server) => server.firewallActive && server.fail2banActive)
      .forEach((server) => {
        (server.attackers || []).forEach((attacker) => {
          attacker.active = false;
          if (attacker.banned) return;
          attacker.visible ??= true;
          attacker.nextAttackAt ??= Date.now() + randomInteger(500, 6000);
        });
        scheduleAttackSimulation(server);
      });
  };
  const clearAttackTimers = () => {
    attackTimers.forEach((timer) => window.clearTimeout(timer));
    attackTimers.clear();
    attackFlashTimers.forEach((timer) => window.clearTimeout(timer));
    attackFlashTimers.clear();
  };
  const drawRoute = (target) => {
    routeLayer.replaceChildren();
    const route = [['Westerstede', 8.11, 53.26], ['Frankfurt DE-CIX', 8.68, 50.11], ['London LINX', -0.12, 51.51], target];
    const points = route.map(([, longitude, latitude]) => project(longitude, latitude));
    routeLayer.appendChild(svgNode('polyline', { points: points.map(([x, y]) => `${x},${y}`).join(' '), class: 'route-line' }));
    route.forEach(([name, longitude, latitude], index) => { const [x, y] = project(longitude, latitude); const group = svgNode('g', { class: `route-node ${index === route.length - 1 ? 'route-target' : ''}` }); group.appendChild(svgNode('circle', { cx: x, cy: y, r: index === route.length - 1 ? 5 : 3.5 })); const label = svgNode('text', { x: x + 8, y: y - 8 }); label.textContent = name; group.appendChild(label); routeLayer.appendChild(group); });
  };
  const loadMap = async () => {
    try {
      const [countries, cities] = await Promise.all([
        fetch('map-data/countries-110m.geojson').then((response) => response.json()),
        fetch('map-data/worldcities.json').then((response) => response.json()),
      ]);
      cityData = cities;
      loadServers();
      assignServerAttackColors();
      saveServers();
      updateSecurityIndicators(installedServers.find((server) => server.hostname === activeSshHost)
        || installedServers.find((server) => server.firewallActive || server.fail2banActive));
      renderBlockedLogs();
      resumePendingAttackSimulations();
      availableDatacenters = availableDatacenters.filter((datacenter) => !installedServers.some((server) => server.ip === datacenter.ip));
      localStorage.setItem(availableDatacentersStorageKey, JSON.stringify(availableDatacenters));
      showServerInfo();
      drawFeatures(countryLayer, countries.features, 'country-border');
      updateMapTransform();
    } catch (error) { }
  };
  mapDataReady = loadMap();
  const isValidIp = (value) => {
    if (typeof value !== 'string') return false;
    const octets = value.split('.');
    return octets.length === 4 && octets.every((octet) => /^(0|[1-9]\d{0,2})$/.test(octet) && Number(octet) <= 255);
  };
  const loadAvailableDatacenters = () => {
    try {
      const storedServers = JSON.parse(localStorage.getItem(serverStorageKey) || '[]');
      const installedIps = new Set(Array.isArray(storedServers) ? storedServers.map((server) => server?.ip).filter((ip) => typeof ip === 'string') : []);
      availableDatacenters = deutsche_rechenzentren.flatMap((datacenter, index) => datacenterIps[index]
        .filter((ip) => !installedIps.has(ip))
        .map((ip) => ({ ...datacenter, ip })));
    } catch (error) {
      availableDatacenters = deutsche_rechenzentren.flatMap((datacenter, index) => datacenterIps[index].map((ip) => ({ ...datacenter, ip })));
    }
    localStorage.setItem(availableDatacentersStorageKey, JSON.stringify(availableDatacenters));
  };
  const initializeAppData = () => {
    localStorage.setItem(osImagesStorageKey, JSON.stringify(availableOsImages));
    loadAvailableDatacenters();
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
  };
  document.querySelector('#zoom-in').addEventListener('click', () => setZoom(mapState.zoom + 2));
  document.querySelector('#zoom-out').addEventListener('click', () => setZoom(mapState.zoom - 2));
  document.querySelector('#zoom-reset').addEventListener('click', () => { mapState.panX = 0; mapState.panY = 0; setZoom(0); });
  mapSvg.addEventListener('wheel', (event) => { event.preventDefault(); const focalPoint = svgPointFromEvent(event); const step = Math.max(2, Math.min(8, Math.abs(event.deltaY) / 40)); setZoom(mapState.zoom + (event.deltaY < 0 ? step : -step), focalPoint); }, { passive: false });
  mapSvg.addEventListener('pointerdown', (event) => {
    mapState.dragging = true;
    mapState.lastX = event.clientX;
    mapState.lastY = event.clientY;
    mapSvg.setPointerCapture(event.pointerId);
  });
  mapSvg.addEventListener('pointermove', (event) => { if (!mapState.dragging) return; const bounds = mapSvg.getBoundingClientRect(); mapState.panX += (event.clientX - mapState.lastX) * (1000 / bounds.width); mapState.panY += (event.clientY - mapState.lastY) * (560 / bounds.height); mapState.lastX = event.clientX; mapState.lastY = event.clientY; updateMapTransform(); });
  mapSvg.addEventListener('pointerup', () => { mapState.dragging = false; });
  const terminalTabs = document.querySelector('#terminal-tabs');
  const terminalContainer = document.querySelector('#terminal');
  const safeEntriesElement = document.querySelector('#safe-entries');

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
          hostname: { type: 'file', content: 'localpc' },
          motd: { type: 'file', content: 'Welcome to ptux Linux 1.0 (browser build)' },
          'os-release': { type: 'file', content: 'NAME="ptux Linux"\nVERSION="1.0 (Browser Edition)"\nID=ptux' },
        },
      },
      home: {
        type: 'dir',
        entries: {
          secadmin: {
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

  const basePackages = {
    apt: '2.7.14', 'base-files': '13ubuntu10', bash: '5.2.21-2ubuntu4', coreutils: '9.4-3ubuntu6',
    curl: '8.5.0-2ubuntu10', 'openssh-client': '1:9.6p1-3ubuntu13', 'openssh-server': '1:9.6p1-3ubuntu13',
    sudo: '1.9.15p5-3ubuntu5',
  };
  const aptUpgradePackages = {
    'base-files': '13ubuntu10.1', bash: '5.2.21-2ubuntu4.1', coreutils: '9.4-3ubuntu6.1',
    curl: '8.5.0-2ubuntu10.2', 'openssh-client': '1:9.6p1-3ubuntu13.3', 'openssh-server': '1:9.6p1-3ubuntu13.3',
    sudo: '1.9.15p5-3ubuntu5.1',
  };
  const adminToolsPackages = ['admintools', 'fail2ban', 'nmap', 'rkhunter', 'ufw'];
  const commandNames = ['addsuperuser', 'analyzemonitor', 'blockip', 'cat', 'cd', 'clear', 'configserver', 'date', 'deployservice', 'echo', 'exit', 'help', 'history', 'hostname', 'incidentreport', 'installserver', 'integritycheck', 'lockserver', 'ls', 'man', 'mkdir', 'neofetch', 'pwd', 'reset', 'restoreservice', 'rm', 'secureserver', 'ssh', 'startmonitor', 'sudo', 'touch', 'tracert', 'uname', 'whoami', 'which'];
  const remoteCommands = new Set(['help', 'ls', 'cd', 'pwd', 'cat', 'touch', 'mkdir', 'rm', 'echo', 'date', 'whoami', 'uname', 'neofetch', 'history', 'man', 'ssh', 'sudo', 'secureserver']);
  const initialFileSystem = JSON.stringify(fileSystem);
  let currentDirectory = '/home/secadmin';
  let input = '';
  let cursorIndex = 0;
  let history = [];
  let historyIndex = 0;
  const infoSafeEntries = [];
  const terminalSessions = [];
  let terminal;
  let fitAddon;
  let activeSession = null;
  let pendingSshAuth = null;
  let pendingSshPassword = '';
  let activeSshHost = '';
  const revealedPasswords = new Set();

  const fitTerminal = () => window.requestAnimationFrame(() => fitAddon?.fit());
  const persistActiveSession = () => {
    if (!activeSession) return;
    Object.assign(activeSession, { currentDirectory, input, cursorIndex, history, historyIndex, pendingSshAuth, pendingSshPassword, activeSshHost });
  };
  const activateSession = (session) => {
    if (activeSession === session) return;
    persistActiveSession();
    activeSession = session;
    terminal = session.terminal;
    fitAddon = session.fitAddon;
    currentDirectory = session.currentDirectory;
    input = session.input;
    cursorIndex = session.cursorIndex;
    history = session.history;
    historyIndex = session.historyIndex;
    pendingSshAuth = session.pendingSshAuth;
    pendingSshPassword = session.pendingSshPassword;
    activeSshHost = session.activeSshHost;
    updateSecurityIndicators(installedServers.find((server) => server.hostname === activeSshHost)
      || installedServers.find((server) => server.firewallActive || server.fail2banActive));
    terminalSessions.forEach((entry) => {
      entry.container.hidden = entry !== session;
      entry.tab.setAttribute('aria-selected', String(entry === session));
      entry.tab.tabIndex = entry === session ? 0 : -1;
    });
    fitTerminal();
    terminal.focus();
  };
  const createTerminalSession = (hostname = '') => {
    const container = terminalSessions.length ? document.createElement('div') : terminalContainer;
    container.className = 'terminal-body terminal-instance';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', hostname ? `Remote-Terminal ${hostname}` : 'Interaktives Linux-Terminal');
    container.hidden = true;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'terminal-tab';
    tab.setAttribute('role', 'tab');
    tab.textContent = hostname || 'localpc';
    tab.title = hostname ? `Remote-Terminal ${hostname}` : 'Lokales Terminal';
    terminalTabs.appendChild(tab);
    if (terminalSessions.length) document.querySelector('.terminal-window').appendChild(container);
    const sessionTerminal = new Terminal({
      allowProposedApi: true, convertEol: true, cursorBlink: true,
      fontFamily: 'DM Mono, SFMono-Regular, Consolas, monospace', fontSize: 14,
      lineHeight: 1.35, scrollback: 1200,
      theme: {
        background: '#0d1111', foreground: '#d8ded2', cursor: '#b4d36b', cursorAccent: '#0d1111',
        selectionBackground: 'rgba(180, 211, 107, 0.25)', black: '#0d1111', brightBlack: '#626b66',
        green: '#b4d36b', brightGreen: '#d7f28e', yellow: '#e4c27a', blue: '#78c5c8',
        magenta: '#c6a8cf', cyan: '#78c5c8', white: '#d8ded2',
      },
    });
    const sessionFitAddon = new FitAddon.FitAddon();
    sessionTerminal.loadAddon(sessionFitAddon);
    sessionTerminal.open(container);
    const session = {
      terminal: sessionTerminal, fitAddon: sessionFitAddon, container, tab, hostname,
      currentDirectory: '/home/secadmin', input: '', cursorIndex: 0, history: [], historyIndex: 0,
      pendingSshAuth: null, pendingSshPassword: '', activeSshHost: hostname,
      installedPackages: { ...basePackages },
    };
    terminalSessions.push(session);
    tab.addEventListener('click', () => activateSession(session));
    sessionTerminal.onData((data) => { activateSession(session); handleTerminalData(data); });
    new ResizeObserver(() => { if (activeSession === session) fitTerminal(); }).observe(container);
    return session;
  };
  const localSession = createTerminalSession();
  activateSession(localSession);
  const addRemoteTerminal = (hostname) => {
    let session = terminalSessions.find((entry) => entry.hostname === hostname);
    if (!session) {
      if (terminalSessions.length >= 4) return null;
      session = createTerminalSession(hostname);
    }
    const server = installedServers.find((entry) => entry.hostname === hostname);
    if (Array.isArray(server?.terminalHistory)) {
      session.history = server.terminalHistory.slice(-20);
      session.historyIndex = session.history.length;
    }
    session.activeSshHost = hostname;
    session.tab.textContent = hostname;
    activateSession(session);
    activeSshHost = hostname;
    activeSession.activeSshHost = hostname;
    session.terminal.clear();
    return session;
  };
  const clearRemoteTerminals = () => {
    terminalSessions.filter((session) => session !== localSession).forEach((session) => {
      session.terminal.dispose();
      session.tab.remove();
      session.container.remove();
      terminalSessions.splice(terminalSessions.indexOf(session), 1);
    });
    localSession.terminal.clear();
    Object.assign(localSession, { currentDirectory: '/home/secadmin', input: '', cursorIndex: 0, history: [], historyIndex: 0, pendingSshAuth: null, pendingSshPassword: '', activeSshHost: '' });
    activeSession = null;
    activateSession(localSession);
  };
  const closeRemoteTerminal = () => {
    const session = activeSession;
    if (!session || session === localSession) return null;
    const hostname = session.hostname;
    persistActiveSession();
    const server = installedServers.find((entry) => entry.hostname === hostname);
    if (server) {
      server.terminalHistory = session.history.slice(-20);
      saveServers();
    }
    session.terminal.dispose();
    session.tab.remove();
    session.container.remove();
    terminalSessions.splice(terminalSessions.indexOf(session), 1);
    activeSession = null;
    activateSession(localSession);
    return hostname;
  };

  const promptPath = () => {
    if (currentDirectory === '/home/secadmin') return '~';
    if (currentDirectory.startsWith('/home/secadmin/')) return `~/${currentDirectory.slice('/home/secadmin/'.length)}`;
    return currentDirectory;
  };

  const prompt = () => `${colors.green}${activeSshHost ? `${activeSshHost}admin` : 'secadmin'}${colors.reset}@${colors.blue}${activeSshHost || 'localpc'}${colors.reset}:${colors.brightGreen}${promptPath()}${colors.reset}$ `;
  const writePrompt = () => terminal.write(`\r\n${prompt()}`);
  const print = (text = '') => text.split('\n').forEach((line) => terminal.writeln(line));
  const appendCodeLine = (text, kind = 'code') => {
    const line = document.createElement('div');
    line.className = `code-line ${kind}`;
    line.textContent = text;
    codeOutput.appendChild(line);
    const lineHeight = parseFloat(getComputedStyle(codeOutput).lineHeight) || 16;
    const maxLines = Math.max(1, Math.floor(codeOutput.clientHeight / lineHeight));
    while (codeOutput.children.length > maxLines) codeOutput.firstElementChild.remove();
  };
  const reportGameEvent = (command, args = [], extra = {}) => window.ptuxGame?.recordCommand({ command, args, ...extra });
  const saveServers = () => localStorage.setItem(serverStorageKey, JSON.stringify(installedServers));
  const saveHistory = () => {
    if (!activeSshHost) {
      localStorage.setItem(historyStorageKey, JSON.stringify(history));
      return;
    }
    const server = installedServers.find((entry) => entry.hostname === activeSshHost);
    if (!server) return;
    server.terminalHistory = history.slice(-20);
    saveServers();
  };
  let infoSafeKeyPromise;
  const getInfoSafeKey = () => {
    if (!infoSafeKeyPromise) {
      const keyMaterial = new TextEncoder().encode('ptuxSecurity simulated Info-Safe key v1');
      infoSafeKeyPromise = crypto.subtle.digest('SHA-256', keyMaterial).then((digest) => crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']));
    }
    return infoSafeKeyPromise;
  };
  const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
  const fromBase64 = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  const saveInfoSafe = async () => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plainText = new TextEncoder().encode(JSON.stringify(infoSafeEntries));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getInfoSafeKey(), plainText);
    localStorage.setItem(infoSafeStorageKey, JSON.stringify({ version: 1, iv: toBase64(iv), data: toBase64(new Uint8Array(encrypted)) }));
  };
  const renderInfoSafe = () => {
    safeEntriesElement.replaceChildren();
    if (!infoSafeEntries.length) {
      const empty = document.createElement('span');
      empty.className = 'empty-state';
      empty.textContent = 'Noch keine Zugangsdaten gespeichert.';
      safeEntriesElement.appendChild(empty);
      return;
    }
    infoSafeEntries.forEach((entry) => {
      const row = document.createElement('article');
      row.className = 'safe-entry';
      const hostname = document.createElement('strong');
      hostname.textContent = entry.hostname;
      const username = document.createElement('span');
      username.textContent = `Benutzer: ${entry.username}`;
      const passwordLine = document.createElement('div');
      passwordLine.className = 'safe-password-line';
      const password = document.createElement('span');
      password.className = 'safe-password';
      const revealed = revealedPasswords.has(entry.hostname);
      password.textContent = revealed ? entry.password : '•'.repeat(entry.password.length);
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'safe-reveal-button';
      toggle.setAttribute('aria-label', revealed ? `Passwort für ${entry.hostname} verbergen` : `Passwort für ${entry.hostname} anzeigen`);
      toggle.title = revealed ? 'Passwort verbergen' : 'Passwort anzeigen';
      toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
      toggle.addEventListener('click', () => {
        if (revealedPasswords.has(entry.hostname)) revealedPasswords.delete(entry.hostname);
        else revealedPasswords.add(entry.hostname);
        renderInfoSafe();
      });
      passwordLine.append(password, toggle);
      row.append(hostname, username, passwordLine);
      safeEntriesElement.appendChild(row);
    });
  };
  const loadInfoSafe = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem(infoSafeStorageKey) || 'null');
      if (!stored) { renderInfoSafe(); return; }
      if (stored.version !== 1) throw new Error('Unbekannte Info-Safe-Version');
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(stored.iv) }, await getInfoSafeKey(), fromBase64(stored.data));
      const entries = JSON.parse(new TextDecoder().decode(plaintext));
      if (!Array.isArray(entries)) throw new Error('Ungültiger Info-Safe-Inhalt');
      infoSafeEntries.push(...entries.filter((entry) => entry && typeof entry.hostname === 'string' && typeof entry.username === 'string' && typeof entry.password === 'string'));
    } catch (error) {
      console.error('Info-Safe konnte nicht entschlüsselt werden.', error);
    }
    renderInfoSafe();
  };
  const loadHistory = () => {
    try {
      const storedHistory = JSON.parse(localStorage.getItem(historyStorageKey) || '[]');
      history = Array.isArray(storedHistory) ? storedHistory.filter((item) => typeof item === 'string').slice(-20) : [];
    } catch (error) {
      history = [];
    }
    historyIndex = history.length;
  };
  const loadServers = () => {
    try {
      const storedServers = JSON.parse(localStorage.getItem(serverStorageKey) || '[]');
      installedServers = Array.isArray(storedServers) ? storedServers.map((server) => {
        if (server.datacenter) return server;
        const legacyCity = server.city;
        const datacenter = legacyCity ? findDatacenter(legacyCity.name) : null;
        return datacenter ? { ...server, datacenter: { ...datacenter, ip: server.ip } } : null;
      }).filter(Boolean) : [];
      saveServers();
    } catch (error) {
      installedServers = [];
    }
  };
  const showServerInfo = () => {
    serverInfo.replaceChildren();
    if (!installedServers.length) {
      serverInfo.innerHTML = '<span class="empty-state"></span>';
      return;
    }
    installedServers.forEach((server) => {
      const details = document.createElement('div');
      details.className = 'server-entry';
      const summary = document.createElement('div');
      summary.textContent = `${server.hostname} - ${server.os} - ${server.datacenter?.name || 'nicht gefunden'} - ${server.ip}`;
      const coordinates = document.createElement('div');
      coordinates.textContent = `Lat: ${server.datacenter ? server.datacenter.lat.toFixed(5) : '-'} - Lon: ${server.datacenter ? server.datacenter.lon.toFixed(5) : '-'}`;
      details.append(summary, coordinates);
      serverInfo.appendChild(details);
    });
  };
  const findDatacenter = (name) => deutsche_rechenzentren.find((datacenter) => datacenter.name.toLocaleLowerCase() === name.toLocaleLowerCase());
  const isValidHostname = (value) => typeof value === 'string' && /^(?=.{1,63}$)[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(value);
  const printInstallServerOptions = () => {
    const datacenterLabels = deutsche_rechenzentren.map((datacenter, index) => {
      return `${datacenter.name} (${datacenterIps[index].join(', ')})`;
    });
    print(`${colors.orange}installserver <hostname> <ipadresse> <os>${colors.reset}`);
    print(`${colors.orange}Beispiel für Hostname: server01${colors.reset}`);
    print(`${colors.orange}verfügbare Betriebssysteme (OS): ${availableOsImages.join(', ')}${colors.reset}`);
    print(`${colors.orange}Rechenzentren: ${datacenterLabels.join(', ')}${colors.reset}`);
  };
  const printInstallServerError = (message) => {
    print(`${colors.orange}${message}${colors.reset}`);
    printInstallServerOptions();
  };
  const validateInstallServer = async ([hostname, ip, os]) => {
    if (!availableOsImages.includes(os)) {
      printInstallServerError(`installserver: OS-Image '${os}' ist nicht verfügbar.`);
      return null;
    }
    if (!isValidIp(ip)) {
      printInstallServerError(`installserver: '${ip}' ist keine gültige IPv4-Adresse.`);
      return null;
    }
    if (!isValidHostname(hostname)) {
      printInstallServerError(`installserver: Hostname '${hostname}' ist ungültig. Erlaubt sind Buchstaben, Zahlen und Bindestriche.`);
      return null;
    }
    const hostnameAlreadyInstalled = installedServers.some((server) => server.hostname.toLocaleLowerCase() === hostname.toLocaleLowerCase());
    const ipAlreadyInstalled = installedServers.some((server) => server.ip === ip);
    if (hostnameAlreadyInstalled && ipAlreadyInstalled) {
      printInstallServerError(`Ein Server mit der IP-Adresse '${ip}' und dem Hostnamen '${hostname}' ist bereits installiert.`);
      return null;
    }
    if (ipAlreadyInstalled) {
      printInstallServerError(`Ein Server mit der IP-Adresse '${ip}' ist bereits installiert.`);
      return null;
    }
    if (hostnameAlreadyInstalled) {
      printInstallServerError(`Ein Server mit dem Hostnamen '${hostname}' ist bereits installiert.`);
      return null;
    }
    const datacenter = availableDatacenters.find((entry) => entry.ip === ip);
    if (!datacenter) {
      printInstallServerError(`installserver: IP-Adresse '${ip}' ist keinem verfügbaren Rechenzentrum zugeordnet.`);
      return null;
    }
    return datacenter;
  };
  const generateBootstrapPassword = () => Array.from(crypto.getRandomValues(new Uint32Array(3)), (value) => window.PTUX_PASSWORD_WORDS[value % window.PTUX_PASSWORD_WORDS.length]).join('-');
  const installServer = async (args) => {
    if (args.length !== 3) {
      printInstallServerOptions();
      return;
    }
    const [hostname, ip, os] = args;
    const datacenter = await validateInstallServer(args);
    if (!datacenter) return;
    const credentials = { username: `${hostname}admin`, password: generateBootstrapPassword() };
    availableDatacenters = availableDatacenters.filter((entry) => !(entry.name === datacenter.name && entry.ip === datacenter.ip));
    localStorage.setItem(availableDatacentersStorageKey, JSON.stringify(availableDatacenters));
    const script = [
      '#!/usr/bin/env ptuXOS-installer',
      `echo "PXE boot: ${hostname}"`,
      `set server_ip=${ip}`,
      `set datacenter=${datacenter.name}`,
      `set hostname=${hostname}`,
      'pxe-client --discover --interface eth0',
      'pxe-client --load kernel.ptux',
      'pxe-client --load initrd.ptux',
      `ptux-install --target /dev/sda --os ${os}`,
      'ptux-install --partition-layout guided',
      'ptux-install --network dhcp --offline',
      `ptux-install --hostname ${hostname}`,
      'ptux-secret create --name bootstrap-password --random --length 3-words',
      `ptux-user add --username ${credentials.username} --groups sudo --home /home/${credentials.username}`,
      `ptux-user set-password --username ${credentials.username} --password-from-secret bootstrap-password`,
      'ptux-install --enable ssh',
      'ptux-install --write-bootloader',
      'system-image --verify ptuXOS-base.img',
      'system-image --extract ptuXOS-base.img /target',
      'configure-locale de_DE.UTF-8',
      'configure-timezone Europe/Berlin',
      'configure-network --apply',
      'service ssh enable',
      'service network restart',
      'sync /target/boot',
      'umount /target',
      'reboot --target-server',
    ];
    let step = 0;
    appendCodeLine(`[installserver] PXE-Installation gestartet: ${hostname}`, 'output');
    const completeInstallation = async () => {
      const server = { os, ip, hostname, datacenter };
      const safeEntry = { hostname, ...credentials };
      infoSafeEntries.push(safeEntry);
      try {
        await saveInfoSafe();
      } catch (error) {
        infoSafeEntries.pop();
        print(`${colors.orange}Info-Safe konnte nicht verschlüsselt gespeichert werden. Installation nicht übernommen.${colors.reset}`);
        return;
      }
      renderInfoSafe();
      installedServers.push(server);
      assignServerAttackColors();
      saveServers();
      showServerInfo();
      updateMapTransform();
      appendCodeLine(`[installserver] Installation abgeschlossen: ${hostname}`, 'output');
      reportGameEvent('installserver', args, { server });
    };
    const installationTimer = window.setInterval(() => {
      appendCodeLine(script[step++]);
      if (step === script.length) {
        window.clearInterval(installationTimer);
        installationTimers.delete(installationTimer);
        completeInstallation();
      }
    }, 200);
    installationTimers.add(installationTimers);
    print(`${colors.green}Remote-Installation wurde gestartet${colors.reset}`);
  };
  const addSuperuser = (args) => {
    if (args.length !== 2) {
      print(`${colors.orange}addsuperuser: usage: addsuperuser <username> <password>${colors.reset}`);
      return;
    }
    const [username, password] = args;
    appendCodeLine(`useradd ${username}`);
    appendCodeLine(`passwd ${username} ${password}`);
    appendCodeLine(`usermod -aG sudo ${username}`);
    print(`useradd: user '${username}' created`);
    print(`passwd: password updated successfully for ${username}`);
    print(`${colors.green}User '${username}' wurde der sudo-Gruppe hinzugefügt.${colors.reset}`);
  };
  const getInstalledServer = (hostname) => installedServers.find((server) => server.hostname.toLocaleLowerCase() === hostname?.toLocaleLowerCase());
  const startSshLogin = (args) => {
    if (args.length !== 1 || !args[0].includes('@')) {
      print(`${colors.orange}ssh: usage: ssh <benutzername>@<hostname>${colors.reset}`);
      return;
    }
    const [username, hostname] = args[0].split('@');
    const server = getInstalledServer(hostname);
    const credentials = server && infoSafeEntries.find((entry) => entry.hostname.toLocaleLowerCase() === server.hostname.toLocaleLowerCase());
    if (!server || !credentials || credentials.username !== username) {
      print(`${colors.orange}ssh: unbekannter Benutzer oder Server.${colors.reset}`);
      return;
    }
    pendingSshAuth = { server, credentials };
    pendingSshPassword = '';
    terminal.write(`${colors.blue}${username}@${hostname}'s password: ${colors.reset}`);
    return 'ssh-password-prompt';
  };
  const runMetaCommand = (command, args) => {
    const server = getInstalledServer(args[0]);
    if (['configserver', 'deployservice', 'startmonitor', 'lockserver', 'restoreservice'].includes(command) && !server) {
      print(`${colors.orange}${command}: Server '${args[0] || ''}' ist nicht installiert.${colors.reset}`);
      return false;
    }
    if (command === 'configserver') {
      if (args.length !== 1) { print(`${colors.orange}configserver: usage: configserver <hostname>${colors.reset}`); return false; }
      ['sshd --enable', 'ufw default deny incoming', 'ufw allow ssh', 'ufw --enable'].forEach((line) => appendCodeLine(`[configserver] ${line} --target ${args[0]}`));
      print(`${colors.green}${args[0]}: Benutzer, SSH und Firewall sind eingerichtet.${colors.reset}`);
    } else if (command === 'deployservice') {
      if (args.length !== 2 || !['web', 'dns'].includes(args[1])) { print(`${colors.orange}deployservice: usage: deployservice <hostname> <web|dns>${colors.reset}`); return false; }
      appendCodeLine(`[deployservice] service ${args[1]} enable --target ${args[0]}`);
      appendCodeLine(`[deployservice] service ${args[1]} start --target ${args[0]}`);
      print(`${colors.green}${args[1]}-Dienst auf ${args[0]} ist aktiv.${colors.reset}`);
    } else if (command === 'startmonitor') {
      if (args.length !== 1) { print(`${colors.orange}startmonitor: usage: startmonitor <hostname>${colors.reset}`); return false; }
      appendCodeLine(`[startmonitor] monitor-agent --install --target ${args[0]}`);
      appendCodeLine(`[startmonitor] monitor-agent --start --target ${args[0]}`);
      print(`${colors.green}Monitoring auf ${args[0]} gestartet.${colors.reset}`);
    } else if (command === 'analyzemonitor') {
      appendCodeLine('[analyzemonitor] monitorctl --read /var/log/auth.log');
      appendCodeLine('[analyzemonitor] pattern=brute-force action=flag');
      print(`${colors.orange}Verdächtige IPs: 203.0.113.42, 198.51.100.23, 192.0.2.77${colors.reset}`);
      print(`${colors.green}Angriffsmuster erkannt: wiederholte SSH-Fehlversuche.${colors.reset}`);
    } else if (command === 'blockip') {
      if (args.length !== 1 || !isValidIp(args[0])) { print(`${colors.orange}blockip: usage: blockip <ipadresse>${colors.reset}`); return false; }
      appendCodeLine(`[blockip] ufw deny from ${args[0]}`);
      print(`${colors.green}Firewall-Regel aktiv: ${args[0]} wird verworfen.${colors.reset}`);
    } else if (command === 'lockserver') {
      if (args.length !== 1) { print(`${colors.orange}lockserver: usage: lockserver <hostname>${colors.reset}`); return false; }
      appendCodeLine(`[lockserver] nftables --policy drop --target ${args[0]}`);
      appendCodeLine(`[lockserver] service web stop --target ${args[0]}`);
      print(`${colors.orange}${args[0]} wurde in den Notfallmodus versetzt.${colors.reset}`);
    } else if (command === 'integritycheck') {
      appendCodeLine('[integritycheck] aide --check --all-servers');
      print(`${colors.green}Integritaetspruefung abgeschlossen: keine manipulierten Systemdateien gefunden.${colors.reset}`);
    } else if (command === 'restoreservice') {
      if (args.length !== 2 || args[1] !== 'web') { print(`${colors.orange}restoreservice: usage: restoreservice <hostname> web${colors.reset}`); return false; }
      appendCodeLine(`[restoreservice] nftables --policy allow --target ${args[0]}`);
      appendCodeLine(`[restoreservice] service web start --target ${args[0]}`);
      print(`${colors.green}Webdienst auf ${args[0]} kontrolliert wiederhergestellt.${colors.reset}`);
    } else if (command === 'incidentreport') {
      if (!args.length) { print(`${colors.orange}incidentreport: usage: incidentreport <zusammenfassung>${colors.reset}`); return false; }
      appendCodeLine(`[incidentreport] reportctl --create --text "${args.join(' ')}"`);
      print(`${colors.green}Incident-Report gespeichert und an das Security-Team übergeben.${colors.reset}`);
    }
    reportGameEvent(command, args);
    return true;
  };
  const secureServer = (args) => {
    if (args.length) {
      print(`${colors.orange}secureserver: usage: secureserver${colors.reset}`);
      return;
    }
    if (!activeSshHost) {
      print(`${colors.orange}secureserver: zuerst per SSH auf dem Server anmelden.${colors.reset}`);
      return;
    }
    const server = getInstalledServer(activeSshHost);
    if (!server) {
      print(`${colors.orange}secureserver: Server '${activeSshHost}' ist nicht installiert.${colors.reset}`);
      return;
    }
    if (!['admintools', 'ufw', 'fail2ban'].every((packageName) => activeSession.installedPackages[packageName])) {
      print(`${colors.orange}secureserver: zuerst 'sudo apt install admintools' ausführen.${colors.reset}`);
      return;
    }
    const protectionsWereActive = server.firewallActive && server.fail2banActive;
    server.firewallActive = true;
    server.fail2banActive = true;
    if (!server.attackers?.length) server.attackScheduledAt ??= Date.now() + 3500;
    saveServers();
    updateSecurityIndicators(server);
    appendCodeLine(`[secureserver] ufw --enable --target ${server.hostname}`);
    appendCodeLine(`[secureserver] fail2ban-client start --target ${server.hostname}`);
    print(`${colors.green}Firewall und fail2ban auf ${server.hostname} sind aktiv.${colors.reset}`);
    if (!protectionsWereActive) {
      appendMonitorMessage(`Firewall aktiv: eingehende Verbindungen auf ${server.hostname} werden geprüft.`);
      appendMonitorMessage(`fail2ban aktiv: Authentifizierungsversuche auf ${server.hostname} werden überwacht.`);
    }
    scheduleAttackSimulation(server);
    reportGameEvent('secureserver', [], { server });
  };
  const resetSimulation = () => {
    installationTimers.forEach((timer) => window.clearInterval(timer));
    installationTimers.clear();
    clearAttackTimers();
    localStorage.clear();
    infoSafeEntries.length = 0;
    revealedPasswords.clear();
    renderInfoSafe();
    saveInfoSafe().catch((error) => console.error('Info-Safe konnte nicht gespeichert werden.', error));
    initializeAppData();
    installedServers = [];
    showServerInfo();
    updateSecurityIndicators(null);
    renderBlockedLogs();
    attackLayer.replaceChildren();
    serverLayer.replaceChildren();
    clearMonitorOutput();
    codeOutput.replaceChildren();
    Object.keys(fileSystem.entries).forEach((key) => delete fileSystem.entries[key]);
    Object.assign(fileSystem, JSON.parse(initialFileSystem));
    currentDirectory = '/home/secadmin';
    input = '';
    cursorIndex = 0;
    history = [];
    historyIndex = 0;
    localStorage.removeItem(historyStorageKey);
    terminal.clear();
    pendingSshAuth = null;
    pendingSshPassword = '';
    activeSshHost = '';
    clearRemoteTerminals();
    window.ptuxGame?.reset();
    print(`${colors.green}Simulation zurückgesetzt. localStorage wurde geleert.${colors.reset}`);
  };

  function resolvePath(path = '~') {
    let target = path;
    if (target === '~' || target.startsWith('~/')) target = `/home/secadmin${target.slice(1)}`;
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

  const writeAptLines = (session, lines) => lines.reduce((pending, line) => pending.then(() => new Promise((resolve) => {
    window.setTimeout(() => {
      if (!terminalSessions.includes(session)) { resolve(); return; }
      session.terminal.writeln(line, () => {
        session.terminal.scrollToBottom();
        resolve();
      });
    }, 100);
  })), Promise.resolve());

  function runApt(session, args) {
    const [action, ...packages] = args;
    if (!action) return writeAptLines(session, ['apt 2.7.14 (amd64)', 'Usage: apt [options] command', '       apt update | upgrade | install <package>']);
    if (action === 'update') {
      const upgradableCount = Object.entries(aptUpgradePackages).filter(([name, version]) => session.installedPackages[name] && session.installedPackages[name] !== version).length;
      return writeAptLines(session, [
        `${colors.muted}Hit:1 http://archive.ptuxos.de/ptuxos InRelease${colors.reset}`,
        `${colors.green}Get:2 http://archive.ptuxos.de/ptuxos-updates InRelease [126 kB]${colors.reset}`,
        `${colors.green}Get:3 http://security.ptuxos.de/ptuxos-security InRelease [126 kB]${colors.reset}`,
        'Fetched 252 kB in 1s (361 kB/s)', 'Reading package lists... Done', 'Building dependency tree... Done',
        'Reading state information... Done', `${upgradableCount} packages can be upgraded. Run 'apt list --upgradable' to see them.`,
      ]);
    }
    if (action === 'upgrade') {
      const upgrades = Object.entries(aptUpgradePackages).filter(([name, version]) => session.installedPackages[name] && session.installedPackages[name] !== version);
      if (!upgrades.length) return writeAptLines(session, [
        'Reading package lists... Done', 'Building dependency tree... Done', 'Reading state information... Done',
        'Calculating upgrade... Done', '0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.',
      ]);
      const names = upgrades.map(([name]) => name);
      const lines = [
        'Reading package lists... Done', 'Building dependency tree... Done', 'Reading state information... Done',
        'Calculating upgrade... Done', 'The following packages will be upgraded:', `  ${names.join(' ')}`,
        `${names.length} upgraded, 0 newly installed, 0 to remove and 0 not upgraded.`,
        'Need to get 12.4 MB of archives.', 'After this operation, 4096 B of additional disk space will be used.',
        ...upgrades.map(([name, version], index) => `Get:${index + 1} http://archive.ptuxos.de/ptuxos-updates/main amd64 ${name} ${version} [${index + 1} MB]`),
        'Fetched 12.4 MB in 2s (6,200 kB/s)',
        ...upgrades.flatMap(([name]) => [`Preparing to unpack .../${name}.deb ...`, `Unpacking ${name} ...`]),
        ...upgrades.map(([name]) => `Setting up ${name} ...`), 'Processing triggers for man-db ...',
      ];
      return writeAptLines(session, lines).then(() => upgrades.forEach(([name, version]) => { session.installedPackages[name] = version; }));
    }
    if (action === 'install') {
      if (!packages.length) return writeAptLines(session, ['Reading package lists... Done', 'Building dependency tree... Done', 'Reading state information... Done', 'E: At least one package name is required.']);
      const unknownPackage = packages.find((name) => name !== 'admintools');
      if (unknownPackage) return writeAptLines(session, [
        'Reading package lists... Done', 'Building dependency tree... Done', 'Reading state information... Done',
        `E: Unable to locate package ${unknownPackage}`,
      ]);
      const alreadyInstalled = session.installedPackages.admintools;
      if (alreadyInstalled) return writeAptLines(session, [
        'Reading package lists... Done', 'Building dependency tree... Done', 'Reading state information... Done',
        'admintools is already the newest version (1.0).', '0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.',
      ]);
      const additionalPackages = adminToolsPackages.filter((name) => name !== 'admintools' && !session.installedPackages[name]);
      const newPackages = ['admintools', ...additionalPackages];
      const lines = [
        'Reading package lists... Done', 'Building dependency tree... Done', 'Reading state information... Done',
        'The following additional packages will be installed:', `  ${additionalPackages.join(' ')}`,
        'The following NEW packages will be installed:', `  ${newPackages.join(' ')}`,
        `0 upgraded, ${newPackages.length} newly installed, 0 to remove and 0 not upgraded.`,
        'Need to get 6,248 kB of archives.', 'After this operation, 27.4 MB of additional disk space will be used.',
        ...newPackages.map((name, index) => `Get:${index + 1} http://archive.ptuxos.de/ptuxos/universe amd64 ${name} 1.0 [${index + 1} MB]`),
        'Fetched 6,248 kB in 1s (6,248 kB/s)',
        ...newPackages.flatMap((name) => [`Selecting previously unselected package ${name}.`, `Preparing to unpack .../${name}.deb ...`, `Unpacking ${name} ...`]),
        ...newPackages.map((name) => `Setting up ${name} ...`), 'Processing triggers for man-db ...',
      ];
      return writeAptLines(session, lines).then(() => newPackages.forEach((name) => { session.installedPackages[name] = '1.0'; }));
    }
    return writeAptLines(session, [`E: Invalid operation ${action}`]);
  }

  function listDirectory(path, showAll, longFormat) {
    const node = getNode(path);
    if (!node) return `${colors.orange}ls: cannot access '${path}': No such file or directory${colors.reset}`;
    if (node.type !== 'dir') return longFormat ? `-rw-r--r--  1 secadmin secadmin  ${node.content.length.toString().padStart(4, ' ')}  ${path}` : path;
    const entries = Object.keys(node.entries).sort();
    const visible = showAll ? ['.', '..', ...entries] : entries;
    if (!longFormat) return visible.map((entry) => node.entries[entry]?.type === 'dir' ? `${colors.blue}${entry}/${colors.reset}` : entry).join('  ');
    return visible.map((entry) => {
      if (entry === '.') return 'drwxr-xr-x  4 secadmin secadmin  4096  .';
      if (entry === '..') return 'drwxr-xr-x  4 secadmin secadmin  4096  ..';
      const child = node.entries[entry];
      const mode = child.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
      const size = child.type === 'file' ? child.content.length : 4096;
      const styledName = child.type === 'dir' ? `${colors.blue}${entry}${colors.reset}` : entry;
      return `${mode}  1 secadmin secadmin  ${size.toString().padStart(4, ' ')}  ${styledName}`;
    }).join('\n');
  }

  function execute(commandLine) {
    if (!activeSshHost && commandLine.trim().toLowerCase() === 'reset simulation') { resetSimulation(); return; }
    const args = parseArgs(commandLine);
    const command = args.shift();
    if (!command) return;
    if (activeSshHost && command !== 'exit' && !remoteCommands.has(command)) {
      print(`${colors.orange}bash: ${command}: command not found${colors.reset}`);
      return;
    }
    if (command === 'clear') { terminal.clear(); return; }
    if (command === 'help') {
      if (activeSshHost) {
        print(`${colors.brightGreen}ptux shell${colors.reset} ${colors.dim}:: available commands${colors.reset}`);
        print('');
        [['help', 'show this command list'], ['ls', 'list directory contents'], ['cd', 'change directory'], ['pwd', 'print working directory'], ['cat', 'print file contents'], ['touch', 'create an empty file'], ['mkdir', 'create a directory'], ['rm', 'remove a file or directory'], ['echo', 'print text'], ['date', 'show local date and time'], ['whoami', 'print current user'], ['uname', 'print system information'], ['neofetch', 'show system summary'], ['history', 'show command history'], ['man', 'open a compact manual'], ['sudo apt', 'update, upgrade or install simulated packages'], ['secureserver', 'activate firewall and fail2ban'], ['ssh', 'connect to a simulated remote server']].forEach(([name, description]) => print(`  ${colors.green}${name.padEnd(10)}${colors.reset} ${description}`));
        return;
      }
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
      print(`  ${colors.green}sudo apt${colors.reset}     update, upgrade or install simulated packages`);
      print(`  ${colors.green}installserver${colors.reset} install a simulated ptuXOS server`);
      print(`  ${colors.green}ssh${colors.reset}         connect to a simulated remote server`);
      print(`  ${colors.green}addsuperuser${colors.reset}  create a simulated sudo user`);
      print(`  ${colors.green}configserver${colors.reset}   configure SSH and firewall`);
      print(`  ${colors.green}secureserver${colors.reset}  activate firewall and fail2ban`);
      print(`  ${colors.green}deployservice${colors.reset} start a web or DNS service`);
      print(`  ${colors.green}startmonitor${colors.reset}  start server monitoring`);
      print(`  ${colors.green}analyzemonitor${colors.reset} inspect security logs`);
      print(`  ${colors.green}blockip${colors.reset}       add an IP firewall block`);
      print(`  ${colors.green}lockserver${colors.reset}   activate emergency lock-down`);
      print(`  ${colors.green}integritycheck${colors.reset} verify system integrity`);
      print(`  ${colors.green}restoreservice${colors.reset} restore a service`);
      print(`  ${colors.green}incidentreport${colors.reset} save an incident report`);
      print(`  ${colors.green}reset simulation${colors.reset} clear the complete simulation state`);
      return;
    }
    if (command === 'sudo') {
      const utility = args.shift();
      if (utility !== 'apt') return writeAptLines(activeSession, [`sudo: ${utility || 'command'}: command not found`]);
      return runApt(activeSession, args);
    }
    if (command === 'installserver') return installServer(args);
    if (command === 'ssh') return startSshLogin(args);
    if (command === 'secureserver') return secureServer(args);
    if (command === 'addsuperuser') { addSuperuser(args); reportGameEvent(command, args); return; }
    if (['configserver', 'deployservice', 'startmonitor', 'analyzemonitor', 'blockip', 'lockserver', 'integritycheck', 'restoreservice', 'incidentreport'].includes(command)) { runMetaCommand(command, args); return; }
    if (command === 'pwd') { print(currentDirectory); return; }
    if (command === 'whoami') { print(activeSshHost ? `${activeSshHost}admin` : 'secadmin'); return; }
    if (command === 'hostname') { print(activeSshHost || 'localpc'); return; }
    if (command === 'date') { print(new Date().toString()); return; }
    if (command === 'uname') { print(args.includes('-a') ? 'localpc 1.0.0 browser-kernel #1 SMP Web x86_64 GNU/Linux' : 'localpc'); return; }
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
      print(`${colors.green}        .--.       ${colors.brightGreen}secadmin@localpc${colors.reset}`);
      print(`${colors.green}       |o_o |      ${colors.dim}----------------${colors.reset}`);
      print(`${colors.green}       |:_/ |      ${colors.blue}OS${colors.reset}: ptux Linux 1.0`);
      print(`${colors.green}      //   \\ \\     ${colors.blue}Host${colors.reset}: Browser`);
      print(`${colors.green}     (|     | )    ${colors.blue}Shell${colors.reset}: bash-like`);
      print(`${colors.green}    /'\\_   _/\\\\    ${colors.blue}Term${colors.reset}: xterm.js`);
      print(`${colors.green}    \\___)=(___/    ${colors.blue}Mode${colors.reset}: ${colors.brightGreen}offline${colors.reset}`);
      return;
    }
    if (command === 'exit') {
      if (activeSshHost) {
        const disconnectedHost = closeRemoteTerminal();
        if (disconnectedHost) print(`${colors.dim}Verbindung zu ${disconnectedHost} geschlossen.${colors.reset}`);
        return;
      }
      print(`${colors.dim}logout${colors.reset}\n${colors.green}Session kept open. Type ${colors.brightGreen}help${colors.reset} to continue.${colors.reset}`);
      return;
    }
    print(`${colors.orange}bash: ${command}: command not found${colors.reset}`);
  }

  function redrawInput(value = input) {
    cursorIndex = value.length;
    terminal.write(`\r\x1b[2K${prompt()}${value}`);
  }

  function submit() {
    const commandLine = input.trim();
    terminal.write('\r\n');
    if (pendingSshAuth) {
      const { server, credentials } = pendingSshAuth;
      const authenticated = pendingSshPassword === credentials.password;
      pendingSshAuth = null;
      pendingSshPassword = '';
      if (authenticated) {
        terminal.write(prompt());
        const remoteSession = addRemoteTerminal(server.hostname);
        if (!remoteSession) {
          print(`${colors.orange}Maximal vier Terminal-Tabs sind möglich. Es konnte kein Remote-Tab geöffnet werden.${colors.reset}`);
        } else {
          reportGameEvent('ssh', [credentials.username, server.hostname], { server, authenticated: true });
        }
      } else {
        print(`${colors.orange}Permission denied, please try again.${colors.reset}`);
      }
      input = '';
      cursorIndex = 0;
      writePrompt();
      return;
    }
    if (commandLine) {
      history = history.filter((item) => item !== commandLine);
      history.push(commandLine);
      history = history.slice(-20);
      saveHistory();
      historyIndex = history.length;
      const execution = execute(commandLine);
      if (execution === 'ssh-password-prompt') { input = ''; cursorIndex = 0; return; }
      if (execution?.then) {
        const commandSession = activeSession;
        const commandPrompt = prompt();
        execution.then(() => {
          commandSession.input = '';
          commandSession.cursorIndex = 0;
          if (activeSession === commandSession) { input = ''; cursorIndex = 0; }
          const restorePrompt = () => commandSession.terminal.write(`\r\n${commandPrompt}`, () => commandSession.terminal.scrollToBottom());
          if (activeSession === commandSession) {
            window.requestAnimationFrame(() => {
              commandSession.fitAddon.fit();
              commandSession.terminal.scrollToBottom();
              restorePrompt();
            });
          } else restorePrompt();
        });
        return;
      }
    }
    input = '';
    cursorIndex = 0;
    writePrompt();
  }

  function autocomplete() {
    const parts = input.split(/\s+/);
    if (parts.length === 1) {
      const matches = commandNames.filter((name) => (!activeSshHost || remoteCommands.has(name) || name === 'exit') && name.startsWith(input));
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

  function handleTerminalData(data) {
    if (pendingSshAuth) {
      if (data === '\r') { submit(); return; }
      if (data === '\u0003') { pendingSshAuth = null; pendingSshPassword = ''; terminal.write('^C'); input = ''; cursorIndex = 0; writePrompt(); return; }
      if (data === '\u007f') { if (pendingSshPassword.length) { pendingSshPassword = pendingSshPassword.slice(0, -1); terminal.write('\b \b'); } return; }
      if (!data.includes('\u001b')) {
        const passwordChunk = data.replace(/[\r\n]/g, '');
        pendingSshPassword += passwordChunk;
        terminal.write('*'.repeat(passwordChunk.length));
      }
      return;
    }
    if (data === '\r') { submit(); return; }
    if (data === '\u0003') { terminal.write('^C'); input = ''; cursorIndex = 0; writePrompt(); return; }
    if (data === '\u0004') { if (!input) { terminal.write('^D'); writePrompt(); } return; }
    if (data === '\u007f') {
      if (cursorIndex > 0) {
        const remaining = input.slice(cursorIndex);
        input = input.slice(0, cursorIndex - 1) + remaining;
        cursorIndex -= 1;
        terminal.write(`\b${remaining} \x1b[${remaining.length + 1}D`);
      }
      return;
    }
    if (data === '\u001b[3~') {
      if (cursorIndex < input.length) {
        const remaining = input.slice(cursorIndex + 1);
        input = input.slice(0, cursorIndex) + remaining;
        terminal.write(`${remaining} \x1b[${remaining.length + 1}D`);
      }
      return;
    }
    if (data === '\u001b[H' || data === '\u001b[1~' || data === '\u001b[1;5H' || data === '\u0001') { cursorIndex = 0; redrawInputAtCursor(); return; }
    if (data === '\u001b[F' || data === '\u001b[4~' || data === '\u001b[1;5F' || data === '\u0005') { cursorIndex = input.length; redrawInputAtCursor(); return; }
    if (data === '\t') { autocomplete(); return; }
    if (data === '\u001b[A') { historyIndex = Math.max(0, historyIndex - 1); input = history[historyIndex] || ''; redrawInput(); return; }
    if (data === '\u001b[B') { historyIndex = Math.min(history.length, historyIndex + 1); input = history[historyIndex] || ''; redrawInput(); return; }
    if (data === '\u001b[C') { if (cursorIndex < input.length) { cursorIndex += 1; terminal.write('\x1b[C'); } return; }
    if (data === '\u001b[D') { if (cursorIndex > 0) { cursorIndex -= 1; terminal.write('\x1b[D'); } return; }
    if (!data.includes('\u001b')) {
      const inserted = data.replace(/[\r\n]/g, '');
      if (inserted) {
        const remaining = input.slice(cursorIndex);
        input = input.slice(0, cursorIndex) + inserted + remaining;
        cursorIndex += inserted.length;
        terminal.write(`${inserted}${remaining}${remaining.length ? `\x1b[${remaining.length}D` : ''}`);
      }
    }
  }

  function redrawInputAtCursor() {
    const remaining = input.length - cursorIndex;
    redrawInput();
    if (remaining) {
      cursorIndex -= remaining;
      terminal.write(`\x1b[${remaining}D`);
    }
  }

  function reset() {
    Object.keys(fileSystem.entries).forEach((key) => delete fileSystem.entries[key]);
    Object.assign(fileSystem, JSON.parse(initialFileSystem));
    currentDirectory = '/home/secadmin';
    input = '';
    cursorIndex = 0;
    history = [];
    historyIndex = 0;
    clearAttackTimers();
    installedServers = [];
    updateSecurityIndicators(null);
    renderBlockedLogs();
    localSession.installedPackages = { ...basePackages };
    pendingSshAuth = null;
    pendingSshPassword = '';
    activeSshHost = '';
    infoSafeEntries.length = 0;
    revealedPasswords.clear();
    renderInfoSafe();
    saveInfoSafe().catch((error) => console.error('Info-Safe konnte nicht gespeichert werden.', error));
    clearRemoteTerminals();
    localStorage.removeItem(serverStorageKey);
    initializeAppData();
    showServerInfo();
    codeOutput.replaceChildren();
    attackLayer.replaceChildren();
    serverLayer.replaceChildren();
    clearMonitorOutput();
    terminal.clear();
    boot();
  }

  function boot() {
    terminal.write(prompt());
  }

  document.querySelectorAll('[data-command]').forEach((button) => button.addEventListener('click', () => {
    input = button.dataset.command;
    redrawInput();
    submit();
    terminal.focus();
  }));
  window.addEventListener('resize', fitTerminal);
  fitTerminal();
  initializeAppData();
  loadHistory();
  loadInfoSafe().then(() => {
    window.ptuxGame?.start();
    boot();
  });
})();
