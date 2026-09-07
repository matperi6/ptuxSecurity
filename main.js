(() => {
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

  const commandNames = ['cat', 'cd', 'clear', 'date', 'echo', 'exit', 'help', 'history', 'hostname', 'ls', 'man', 'mkdir', 'neofetch', 'pwd', 'rm', 'touch', 'uname', 'whoami', 'which'];
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
