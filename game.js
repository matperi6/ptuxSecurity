(() => {
  const phases = window.PTUX_GAME_DATA || [];
  const state = { phaseIndex: -1, taskIndex: 0, phaseStopped: false, completed: new Set(), servers: {} };
  const aiOutput = document.querySelector('#ai-output');
  let phaseCompletionHandler = null;
  const writeAi = (message) => { if (aiOutput) aiOutput.textContent = message; };
  const currentPhase = () => phases[state.phaseIndex];
  const currentTask = () => currentPhase()?.tasks[state.taskIndex];
  const taskProgress = () => `${state.phaseIndex + 1}/${phases.length} | ${state.taskIndex + 1}/${currentPhase()?.tasks.length || 0}`;

  const renderTask = (prefix = 'Neue Aufgabe') => {
    if (state.phaseIndex < 0) { writeAi(''); return; }
    const phase = currentPhase();
    const task = currentTask();
    if (!phase || !task) {
      const finalPhase = phases[phases.length - 1];
      const finalTask = finalPhase?.tasks[finalPhase.tasks.length - 1];
      const completion = finalTask && state.completed.has(finalTask.id) ? `${finalTask.id}: Aufgabe erfüllt.\n\n` : '';
      writeAi(`${completion}Simulation abgeschlossen. Alle Sicherheitsaufgaben wurden erfolgreich bearbeitet.`);
      return;
    }
    writeAi(`${prefix}\n${phase.id}: ${phase.title}\n\n${task.id}: ${task.title}\n${task.description}\n\nHilfe: ${task.hint}\nFortschritt: ${taskProgress()}`);
  };

  const completeTask = (message) => {
    const task = currentTask();
    if (!task || state.completed.has(task.id)) return;
    const completedPhase = currentPhase();
    state.completed.add(task.id);
    state.taskIndex += 1;
    const phaseCompleted = state.taskIndex >= completedPhase.tasks.length;
    if (phaseCompleted) { state.phaseIndex += 1; state.taskIndex = 0; }
    renderTask(`${task.id} erfolgreich abgeschlossen. Die ptuX-KI gibt die nächste Aufgabe frei.${message || ''}`);
    if (phaseCompleted) phaseCompletionHandler?.(completedPhase.id);
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
    renderTask(`Phase ${phases[phaseIndex].id} gestartet.`);
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
    start: () => renderTask(state.phaseStopped ? 'Übungsmodus ohne Zeitlimit' : 'Neue Aufgabe'),
    startPhase,
    stopPhase,
    setPhaseCompletionHandler: (handler) => { phaseCompletionHandler = typeof handler === 'function' ? handler : null; },
    reset: () => { state.phaseIndex = -1; state.taskIndex = 0; state.phaseStopped = false; state.completed.clear(); state.servers = {}; renderTask(); },
  };
})();