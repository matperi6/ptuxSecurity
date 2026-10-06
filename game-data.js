// Lehrplan und Aufgaben der ptuXSec-Simulation.
// Die Befehle sind bewusst abstrakt: Sie stehen fuer vorbereitete Admin-Skripte.
window.PTUX_GAME_DATA = [
  {
    id: 'P1',
    title: 'Neuen Remote-Server einrichten',
    briefing: 'Baue eine kleine, erreichbare Serverlandschaft auf und dokumentiere die Grundkonfiguration.',
    tasks: [
      { id: 'P1_A1', title: 'Server installieren', description: 'Installiere einen Server in einem Rechenzentrum deiner Wahl.', hint: "Nutze den Befehl 'installserver'", command: 'installserver', goal: '1 Server installiert' },
      { id: 'P1_A2', title: 'Mit SSH am Remote-Server anmelden', description: 'Melde dich mit den Zugangsdaten aus dem Info-Safe auf einem installierten Server an.', hint: 'Nutze ssh <hostname>admin@<hostname> und gib das Passwort aus dem Info-Safe an der Passwortabfrage ein.', command: 'ssh', goal: 'SSH-Anmeldung erfolgreich' },
      { id: 'P1_A3', title: 'Server absichern', description: 'Führe ein Update des Betriebssystems durch. Installiere danach die Admintools und sichere den Server.', hint: "Update des Betriebssystems: 'sudo apt update' und 'sudo apt upgrade'. Admintools installieren: 'sudo apt install admintools'. Server absichern: 'secureserver'", command: 'secureserver', goal: 'Firewall und fail2ban aktiv' },
      { id: 'P1_A4', title: 'Zwei weitere Server installieren', description: 'Installiere zwei weitere Server in einem Rechenzentrum deiner Wahl, führe ein Software-Update durch und sichere den Server.', hint: 'Nutze dazu alle gelernten Befehle.', command: '', goal: 'Mindestens 3 Server abgesichert' },
    ],
  },
];