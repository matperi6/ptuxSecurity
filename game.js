(() => {
  const phases = window.PTUX_GAME_DATA || [];
  const state = { phaseIndex: -1, taskIndex: 0, phaseStopped: false, completed: new Set(), servers: {} };
  const aiOutput = document.querySelector('#ai-output');
  let phaseCompletionHandler = null;
  let aiOutputTimer = null;
  const writeAi = (message) => {
    if (!aiOutput) return;
    window.clearTimeout(aiOutputTimer);
    const characters = Array.from(String(message));
    const outputText = document.createTextNode('');
    aiOutput.replaceChildren(outputText);
    let index = 0;
    const writeNextCharacter = () => {
      if (index >= characters.length) { aiOutputTimer = null; return; }
      outputText.appendData(characters[index]);
      index += 1;
      aiOutputTimer = window.setTimeout(writeNextCharacter, 3);
    };
    writeNextCharacter();
  };
  const showWelcome = () => writeAi('Hallo SecAdmin, ich bin ptuXI deine Admin-KI.\n\nTippe "help" im Terminal ein, um dich mit den verfügbaren Befehlen vertraut zu machen.\n\nWenn du bereit bist, kannst du das Admin-Rogue-Game mit "start p1" starten.');
  const currentPhase = () => phases[state.phaseIndex];
  const currentTask = () => currentPhase()?.tasks[state.taskIndex];
  const taskProgress = () => `Aufgabe: ${state.taskIndex + 1} von ${currentPhase()?.tasks.length || 0}`;

  const renderTask = (prefix = '', completionTime = '') => {
    if (state.phaseIndex < 0) { writeAi(''); return; }
    const phase = currentPhase();
    const task = currentTask();
    if (!phase || !task) {
      const durationMessage = completionTime
        ? `Du hast dafür ${completionTime} benötigt.`
        : 'Die Zeit wurde in diesem Durchlauf nicht erfasst.';
      writeAi(`Alle Aufgaben wurden erfolgreich bearbeitet.\n\n${durationMessage}\n\nDeine besten Zeiten kannst du mit dem Befehl 'highscore p1' anzeigen lassen.`);
      return;
    }
    const prefixText = prefix ? `${prefix}\n` : '';
    writeAi(`${prefixText}Aufgabe ${state.taskIndex + 1}\n${task.description}\n\n${task.hint}\n${taskProgress()}`);
  };

  const completeTask = () => {
    const task = currentTask();
    if (!task || state.completed.has(task.id)) return;
    const completedPhase = currentPhase();
    state.completed.add(task.id);
    state.taskIndex += 1;
    const phaseCompleted = state.taskIndex >= completedPhase.tasks.length;
    if (phaseCompleted) { state.phaseIndex += 1; state.taskIndex = 0; }
    const completionTime = phaseCompleted ? phaseCompletionHandler?.(completedPhase.id) : '';
    renderTask('', completionTime || '');
  };

  const evaluatePhaseProgress = () => {
    if (currentPhase()?.id !== 'P1') return;
    const servers = Object.values(state.servers);
    const requirements = {
      P1_A1: servers.length >= 1,
      P1_A2: servers.some((server) => server.sshConnected),
      P1_A3: servers.some((server) => server.firewallActive && server.fail2banActive),
      P1_A4: servers.filter((server) => server.firewallActive && server.fail2banActive).length >= 3,
    };
    while (currentTask() && requirements[currentTask().id]) {
      completeTask();
    }
  };

  const syncServers = (servers = []) => {
    state.servers = Object.fromEntries(servers
      .filter((server) => server && typeof server.hostname === 'string')
      .map((server) => [server.hostname, {
        hostname: server.hostname,
        sshConnected: server.sshConnected === true,
        packageListsUpdated: server.packageListsUpdated === true,
        osUpgraded: server.osUpgraded === true,
        adminToolsInstalled: server.adminToolsInstalled === true,
        firewallActive: server.firewallActive === true,
        fail2banActive: server.fail2banActive === true,
      }]));
    evaluatePhaseProgress();
  };

  const startPhase = (phaseId) => {
    const phaseIndex = phases.findIndex((phase) => phase.id.toLocaleLowerCase() === String(phaseId).toLocaleLowerCase());
    if (phaseIndex < 0) return false;
    state.phaseIndex = phaseIndex;
    state.taskIndex = 0;
    state.phaseStopped = false;
    renderTask();
    return true;
  };
  const showPhaseIntro = (phaseId) => {
    const phase = phases.find((entry) => entry.id.toLocaleLowerCase() === String(phaseId).toLocaleLowerCase());
    if (!phase) return false;
    writeAi(`${phase.title}\n\n${phase.description || ''}`);
    return true;
  };
  const stopPhase = (phaseId) => {
    const phase = currentPhase();
    if (!phase || phase.id.toLocaleLowerCase() !== String(phaseId).toLocaleLowerCase()) return false;
    state.phaseStopped = true;
    return true;
  };

  const checkTask = (event) => {
    if (!event || event.type === 'reset') return;
    const { server, command, authenticated } = event;
    if (server && typeof server.hostname === 'string') {
      state.servers[server.hostname] = {
        ...(state.servers[server.hostname] || {}),
        hostname: server.hostname,
        sshConnected: server.sshConnected === true || (command === 'ssh' && authenticated === true),
        packageListsUpdated: server.packageListsUpdated === true,
        osUpgraded: server.osUpgraded === true,
        adminToolsInstalled: server.adminToolsInstalled === true,
        firewallActive: server.firewallActive === true,
        fail2banActive: server.fail2banActive === true,
      };
    }
    evaluatePhaseProgress();
  };

  const serialize = () => ({
    phaseIndex: state.phaseIndex,
    taskIndex: state.taskIndex,
    phaseStopped: state.phaseStopped,
    completed: [...state.completed],
    servers: state.servers,
  });
  const restore = (saved) => {
    if (!saved || !Number.isInteger(saved.phaseIndex) || !Number.isInteger(saved.taskIndex)) return false;
    state.phaseIndex = Math.max(-1, Math.min(saved.phaseIndex, phases.length));
    state.taskIndex = Math.max(0, Math.min(saved.taskIndex, currentPhase()?.tasks.length || 0));
    state.phaseStopped = saved.phaseStopped === true;
    ['completed'].forEach((key) => {
      state[key].clear();
      if (Array.isArray(saved[key])) saved[key].forEach((value) => { if (typeof value === 'string') state[key].add(value); });
    });
    state.servers = saved.servers && !Array.isArray(saved.servers) && typeof saved.servers === 'object'
      ? Object.fromEntries(Object.entries(saved.servers).map(([hostname, server]) => [hostname, {
        hostname,
        sshConnected: server?.sshConnected === true,
        packageListsUpdated: server?.packageListsUpdated === true,
        osUpgraded: server?.osUpgraded === true,
        adminToolsInstalled: server?.adminToolsInstalled === true,
        firewallActive: server?.firewallActive === true,
        fail2banActive: server?.fail2banActive === true,
      }]))
      : {};
    return true;
  };
  window.ptuxGame = {
    recordCommand: checkTask,
    serialize,
    restore,
    syncServers,
    showWelcome,
    start: () => renderTask(state.phaseStopped ? 'Übungsmodus ohne Zeitlimit' : ''),
    startPhase,
    showPhaseIntro,
    stopPhase,
    setPhaseCompletionHandler: (handler) => { phaseCompletionHandler = typeof handler === 'function' ? handler : null; },
    reset: () => { state.phaseIndex = -1; state.taskIndex = 0; state.phaseStopped = false; state.completed.clear(); state.servers = {}; renderTask(); },
  };
})();