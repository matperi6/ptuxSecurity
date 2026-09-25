(() => {
  const phases = window.PTUX_GAME_DATA || [];
  const state = { phaseIndex: 0, taskIndex: 0, completed: new Set(), servers: new Set(), configured: new Set(), services: new Set(), monitors: new Set(), blockedIps: new Set(), locked: new Set(), analyzed: false, integrityChecked: false, restored: false, reported: false, sshConnected: false, serverSecured: false };
  const aiOutput = document.querySelector('#ai-output');
  const writeAi = (message) => { if (aiOutput) aiOutput.textContent = message; };
  const currentPhase = () => phases[state.phaseIndex];
  const currentTask = () => currentPhase()?.tasks[state.taskIndex];
  const taskProgress = () => `${state.phaseIndex + 1}/${phases.length} | ${state.taskIndex + 1}/${currentPhase()?.tasks.length || 0}`;

  const renderTask = (prefix = 'Neue Aufgabe') => {
    const phase = currentPhase();
    const task = currentTask();
    if (!phase || !task) { writeAi('Simulation abgeschlossen. Alle Sicherheitsaufgaben wurden erfolgreich bearbeitet.'); return; }
    writeAi(`${prefix}\n${phase.id}: ${phase.title}\n\n${task.id}: ${task.title}\n${task.description}\n\nHilfe: ${task.hint}\nFortschritt: ${taskProgress()}`);
  };

  const completeTask = (message) => {
    const task = currentTask();
    if (!task || state.completed.has(task.id)) return;
    state.completed.add(task.id);
    state.taskIndex += 1;
    if (state.taskIndex >= currentPhase().tasks.length) { state.phaseIndex += 1; state.taskIndex = 0; }
    renderTask(`${task.id} erfolgreich abgeschlossen. Die ptuX-KI gibt die nächste Aufgabe frei.${message || ''}`);
  };

  const checkTask = (event) => {
    const task = currentTask();
    if (!task || event.type === 'reset') return;
    const { command, args = [], server, authenticated } = event;
    if (task.id === 'P1_A1' && command === 'installserver' && server) {
      state.servers.add(server.hostname);
    }
    if (task.id === 'P1_A2' && command === 'ssh' && authenticated) state.sshConnected = true;
    if (task.id === 'P1_A3' && command === 'configserver' && args[0]) state.configured.add(args[0]);
    if (task.id === 'P1_A3' && command === 'secureserver' && server?.firewallActive && server?.fail2banActive) state.serverSecured = true;
    if (task.id === 'P1_A4' && command === 'deployservice' && args[0] && args[1]) state.services.add(`${args[0]}:${args[1]}`);
    if (task.id === 'P1_A5' && command === 'startmonitor' && args[0]) state.monitors.add(args[0]);
    if (task.id === 'P2_A1' && command === 'analyzemonitor') state.analyzed = true;
    if (task.id === 'P2_A2' && command === 'blockip' && args[0]) state.blockedIps.add(args[0]);
    if (task.id === 'P2_A3' && command === 'lockserver' && args[0]) state.locked.add(args[0]);
    if (task.id === 'P3_A1' && command === 'integritycheck') state.integrityChecked = true;
    if (task.id === 'P3_A2' && command === 'restoreservice') state.restored = true;
    if (task.id === 'P3_A3' && command === 'incidentreport') state.reported = true;
    const requirements = { P1_A1: state.servers.size >= 1, P1_A2: state.sshConnected, P1_A3: state.serverSecured, P1_A4: [...state.services].filter((item) => item.endsWith(':web') || item.endsWith(':dns')).length >= 2, P1_A5: state.monitors.size >= 3, P2_A1: state.analyzed, P2_A2: state.blockedIps.size >= 3, P2_A3: state.locked.size >= 1, P3_A1: state.integrityChecked, P3_A2: state.restored, P3_A3: state.reported };
    if (requirements[task.id]) {
      completeTask();
    }
  };

  window.ptuxGame = { recordCommand: checkTask, start: () => renderTask('Guten Morgen secadmin. Die ptuX-KI begleitet deinen Einsatz.'), reset: () => { state.phaseIndex = 0; state.taskIndex = 0; state.completed.clear(); state.servers.clear(); state.configured.clear(); state.services.clear(); state.monitors.clear(); state.blockedIps.clear(); state.locked.clear(); state.analyzed = false; state.integrityChecked = false; state.restored = false; state.reported = false; state.sshConnected = false; state.serverSecured = false; renderTask('Simulation zurueckgesetzt.'); } };
})();