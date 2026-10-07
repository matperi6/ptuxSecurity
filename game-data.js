// Lehrplan und Aufgaben der ptuXSec-Simulation.
// Die Befehle sind bewusst abstrakt: Sie stehen fuer vorbereitete Admin-Skripte.
window.PTUX_GAME_DATA = [
  {
    id: 'P1',
    title: 'Hallo, ich bin ptuXI, deine Admin-KI.',
    description: 'Aufgrund des aktuellen KI-Gesetzes darf ich dich bei dieser Aufgabe nur beraten.\n\nDein erster Auftrag besteht darin, drei Server in verschiedenen deutschen Rechenzentren einzurichten und abzusichern. Dafür hast du 3 Minuten Zeit.',
    briefing: 'Baue eine kleine, erreichbare Serverlandschaft auf und dokumentiere die Grundkonfiguration.',
    tasks: [
      { id: 'P1_A1', title: 'Server installieren', description: 'Installiere einen Server in einem Rechenzentrum deiner Wahl.', hint: "Nutze den Befehl 'installserver' und ergänze notwendige Parameter.", command: 'installserver', goal: '1 Server installiert' },
      { id: 'P1_A2', title: 'Mit SSH am Remote-Server anmelden', description: 'Melde dich mit den Zugangsdaten aus dem Info-Safe auf einem installierten Server an.', hint: 'Nutze ssh <hostname>admin@<hostname> und gib das Passwort aus dem Info-Safe an der Passwortabfrage ein.', command: 'ssh', goal: 'SSH-Anmeldung erfolgreich' },
      { id: 'P1_A3', title: 'Server absichern', description: 'Führe ein Update des Betriebssystems durch. Installiere danach die Admintools und sichere den Server.', hint: "Update des Betriebssystems: 'sudo apt update' und 'sudo apt upgrade'.\nAdmintools installieren: 'sudo apt install admintools'.\nServer absichern: 'secureserver'", command: 'secureserver', goal: 'Firewall und fail2ban aktiv' },
      { id: 'P1_A4', title: 'Zwei weitere Server installieren', description: 'Installiere zwei weitere Server in einem Rechenzentrum deiner Wahl, führe auf beiden ein Software-Update durch und sichere beide ab.', hint: 'Wechsle zuerst wieder zu localpc und nutze dann alle gelernten Befehle.', command: '', goal: 'Mindestens 3 Server abgesichert' },
    ],
  },
];