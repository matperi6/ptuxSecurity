# ptux shell: Befehle

Der Emulator nutzt xterm.js für die Terminal-Darstellung und eine lokale JavaScript-Simulation für die Shell. Es wird kein echter Prozess gestartet und es werden keine Dateien auf dem Host verändert. Das virtuelle Dateisystem wird beim Neuladen oder über `RESET` zurückgesetzt.

## Navigation und Dateien

| Befehl | Funktion | Beispiel |
| --- | --- | --- |
| `pwd` | Gibt das aktuelle Arbeitsverzeichnis aus. | `pwd` |
| `ls` | Listet den Inhalt eines Verzeichnisses auf. Unterstützt `-a`, `-l` und `-la`. | `ls -la` |
| `cd` | Wechselt in ein Verzeichnis. Unterstützt `~`, relative Pfade, `/` und `..`. | `cd documents` |
| `cat` | Gibt den Inhalt einer Datei aus. | `cat readme.txt` |
| `touch` | Erstellt eine leere Datei. | `touch notizen.txt` |
| `mkdir` | Erstellt ein Verzeichnis. | `mkdir projekt` |
| `rm` | Entfernt Dateien; mit `-r` auch Verzeichnisse. | `rm -r projekt` |

## Informationen und Shell

| Befehl | Funktion | Beispiel |
| --- | --- | --- |
| `help` | Zeigt die integrierte Befehlsübersicht. | `help` |
| `man` | Öffnet eine kurze simulierte Handbuchseite. | `man ls` |
| `history` | Zeigt die bisher eingegebenen Befehle der Session. | `history` |
| `echo` | Gibt Text im Terminal aus. | `echo Hallo localpc` |
| `clear` | Leert den sichtbaren Terminal-Inhalt. | `clear` |
| `date` | Gibt Datum und lokale Uhrzeit aus. | `date` |
| `whoami` | Gibt den simulierten Benutzer aus: `secadmin`. | `whoami` |
| `hostname` | Gibt den simulierten Hostnamen aus: `localpc`. | `hostname` |
| `uname` | Gibt den Kernel-Namen aus; `-a` zeigt zusätzliche Simulationsdaten. | `uname -a` |
| `neofetch` | Zeigt eine kompakte Systemzusammenfassung. | `neofetch` |
| `tracert` | Simuliert eine zufällige Offline-Route über Westerstede, IXPs und ein zufälliges Ziel. | `tracert 132.45.32.231` |
| `which` | Gibt einen simulierten Pfad für einen Befehl aus. | `which ls` |
| `exit` | Gibt `logout` aus; die Browser-Session bleibt geöffnet. | `exit` |
| `installserver` | Simuliert die Installation eines ptuXOS-Servers an einem verfügbaren deutschen Rechenzentrum. | `installserver web01 ptuXOS München 51.68.33.30` |
| `ssh` | Startet eine simulierte SSH-Anmeldung; das Passwort wird verdeckt abgefragt. | `ssh secadmin@web01` |
| `addsuperuser` | Fügt einen simulierten Benutzer zur sudo-Gruppe hinzu. | `addsuperuser admin geheim` |
| `configserver` | Richtet Benutzer, SSH und Firewall auf einem installierten Server ein. | `configserver web01` |
| `deployservice` | Aktiviert einen vorbereiteten Web- oder DNS-Dienst. | `deployservice web01 web` |
| `startmonitor` | Installiert und startet den Monitoring-Agenten. | `startmonitor web01` |
| `analyzemonitor` | Liest einen vorbereiteten Auth-Log-Auszug und markiert Angriffsmuster. | `analyzemonitor` |
| `blockip` | Erstellt eine simulierte Firewall-Sperre für eine IPv4-Adresse. | `blockip 203.0.113.42` |
| `lockserver` | Versetzt einen Server in den simulierten Notfallmodus. | `lockserver web01` |
| `integritycheck` | Prüft die Integrität der simulierten Systemdateien. | `integritycheck` |
| `restoreservice` | Nimmt einen Dienst nach einem Vorfall kontrolliert wieder in Betrieb. | `restoreservice web01 web` |
| `incidentreport` | Speichert eine kurze Zusammenfassung des Sicherheitsvorfalls. | `incidentreport SSH Angriff eingedämmt` |

## Spielphasen und Meta-Befehle

Die Inhalte der Missionen liegen getrennt vom Terminal-Code in `game-data.js`. Jede Phase enthält Aufgaben mit ID, Beschreibung, Hilfe und dem erwarteten Meta-Befehl. `game.js` verwaltet den aktuellen Fortschritt und informiert die ptuX-KI im Panel „PTuX-KI“.

Die Aufgaben werden nur durch erfolgreiche Aktionen erfüllt:

| Phase | Aufgaben | Abschlussbedingung |
| --- | --- | --- |
| P1 | Drei Server installieren, per SSH anmelden, Server konfigurieren, Dienste bereitstellen, Monitoring starten | 3 Server, erfolgreicher Login mit einem angezeigten Superuser-Konto, 3 Konfigurationen, Web/DNS und 3 Monitoring-Agenten |
| P2 | Monitoring auswerten, Angriffs-IPs sperren, Server verriegeln | Log-Analyse, 3 definierte IPs blockiert, ein Server im Notfallmodus |
| P3 | Integrität prüfen, Webdienst wiederherstellen, Vorfall dokumentieren | Prüfung, Wiederherstellung und Incident-Report |

Meta-Befehle erzeugen keine echten Prozesse und verändern keinen Host. Der vorbereitete simulierte Script-Aufruf und die Ausgabe werden zeilenweise im Bereich „Code“ angezeigt.

Bei jeder PXE-Installation legt das Installationsskript den Superuser `secadmin` an. Nach der dritten Installation zeigt die ptuX-KI die drei individuellen Zugangspaare einmalig an. Die Passwörter bleiben nur im Arbeitsspeicher der aktuellen Browser-Session und werden nicht in `localStorage` oder der Terminal-History abgelegt. Für P1_A2 meldet man sich mit `ssh secadmin@<hostname>` an und gibt das zugehörige Passwort an der verdeckten Abfrage ein.

## Bedienung

- Die Weltkarte lässt sich mit Mausrad oder `+`/`−` zoomen und per Ziehen verschieben.
- Die Karte verwendet vereinfachte Natural-Earth-110m-Ländergrenzen aus `map-data/countries-110m.geojson`, damit Küstenlinien offline performant bleiben.
- Das Mausrad zoomt in dynamischen Schritten; die Mausposition bleibt dabei das Zoomzentrum. Die Schaltflächen verwenden die Kartenmitte als Zoomzentrum.
- Die Terminal-Leiste ist der Drag-Griff des frei beweglichen Fensters.

`installserver` verwendet die Syntax `installserver <hostname> <os> <stadt> <ipadresse>`. Stadt und IP müssen als verfügbare Rechenzentrum-Kombination angegeben werden. Die zehn verfügbaren Standorte und belegten Server werden im Browser in `localStorage` gespeichert.

## Virtuelles Dateisystem

Beim Start stehen unter anderem diese Pfade zur Verfügung:

```text
/
├── bin/
├── dev/
├── etc/
│   ├── hostname
│   ├── motd
│   └── os-release
├── home/
│   └── secadmin/
│       ├── desktop/
│       ├── documents/
│       ├── downloads/
│       └── readme.txt
├── tmp/
└── usr/
```
