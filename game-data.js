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
      { id: 'P1_A3', title: 'Server absichern', description: 'Installiere die Admintools und sichere den Server', hint: "Admintools installieren: 'sudo apt install admintools'. Server absichern: 'secureserver'", command: 'secureserver', goal: 'Firewall und fail2ban aktiv' },
      { id: 'P1_A4', title: 'Dienste bereitstellen', description: 'Starte Webdienst und DNS-Dienst auf deiner Serverlandschaft.', hint: 'Nutze deployservice <hostname> <dienst> zweimal.', command: 'deployservice', goal: 'Web- und DNS-Dienst bereitgestellt' },
      { id: 'P1_A5', title: 'Monitoring starten', description: 'Aktiviere die Ueberwachung auf allen drei Servern.', hint: 'Nutze startmonitor fuer jeden Server.', command: 'startmonitor', goal: 'Monitoring aktiv' },
    ],
  },
  {
    id: 'P2',
    title: 'Angriff erkennen und abwehren',
    briefing: 'Die ptuX-KI entdeckt ungewoehnliche Zugriffe. Werte die Daten aus und begrenze den Angriff.',
    tasks: [
      { id: 'P2_A1', title: 'Monitoring-Daten auswerten', description: 'Untersuche den bereitgestellten Log-Auszug auf verdaechtige Muster.', hint: 'Fuehre analyzemonitor aus und lies die markierten IPs.', command: 'analyzemonitor', goal: 'Angriffsmuster erkannt' },
      { id: 'P2_A2', title: 'Angriffs-IPs filtern', description: 'Sperre alle drei als feindlich markierten IP-Adressen.', hint: 'Nutze blockip fuer 203.0.113.42, 198.51.100.23 und 192.0.2.77.', command: 'blockip', goal: '3 Angriffs-IPs blockiert' },
      { id: 'P2_A3', title: 'Server verriegeln', description: 'Aktiviere den Notfallmodus fuer den betroffenen Webserver.', hint: 'Nutze lockserver <hostname> fuer den Server mit Webdienst.', command: 'lockserver', goal: 'Notfallmodus aktiv' },
    ],
  },
  {
    id: 'P3',
    title: 'System wiederherstellen',
    briefing: 'Der Angriff ist eingedaemmt. Stelle den Dienst kontrolliert wieder her und sichere die Erkenntnisse.',
    tasks: [
      { id: 'P3_A1', title: 'Integritaet pruefen', description: 'Pruefe die Systemintegritaet und den Zustand aller Server.', hint: 'Nutze integritycheck.', command: 'integritycheck', goal: 'Integritaet bestaetigt' },
      { id: 'P3_A2', title: 'Dienste kontrolliert reaktivieren', description: 'Nimm den Webdienst wieder in Betrieb.', hint: 'Nutze restoreservice <hostname> web.', command: 'restoreservice', goal: 'Webdienst wiederhergestellt' },
      { id: 'P3_A3', title: 'Vorfall dokumentieren', description: 'Erstelle einen kurzen Incident-Report fuer das Security-Team.', hint: 'Nutze incidentreport mit einer kurzen Zusammenfassung.', command: 'incidentreport', goal: 'Incident-Report erstellt' },
    ],
  },
];