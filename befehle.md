# ptux shell: Befehle

Der Emulator nutzt xterm.js für die Terminal-Darstellung und eine lokale JavaScript-Simulation für die Shell. Es wird kein echter Prozess gestartet und es werden keine Dateien auf dem Host verändert. Der Simulationszustand bleibt nach einem Neuladen erhalten und wird mit `reset simulation` zurückgesetzt.

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
| `ptuxfetch` | Zeigt eine kompakte Systemzusammenfassung einschließlich simulierter IP, Gateway und MAC-Adresse des aktuellen Rechners. | `ptuxfetch` |
| `tracert` | Simuliert eine zufällige Offline-Route über Westerstede, IXPs und ein zufälliges Ziel. | `tracert 132.45.32.231` |
| `which` | Gibt einen simulierten Pfad für einen Befehl aus. | `which ls` |
| `exit` | Gibt `logout` aus; die Browser-Session bleibt geöffnet. | `exit` |
| `installserver` | Simuliert die Installation eines ptuXOS-Servers an einem verfügbaren deutschen Rechenzentrum. | `installserver web01 ptuXOS München 51.68.33.30` |
| `ssh` | Startet eine simulierte SSH-Anmeldung; das Passwort wird verdeckt abgefragt. | `ssh secadmin@web01` |
| `addsuperuser` | Fügt einen simulierten Benutzer zur sudo-Gruppe hinzu. | `addsuperuser admin geheim` |
| `start` | Setzt die Simulation zurück und startet eine Phase nach einem zehnsekündigen Countdown. | `start P1` |
| `stop` | Stoppt den Timer der aktiven Phase, ohne Aufgaben oder Highscore zu löschen; die Phase kann zeitlos weitergespielt werden. | `stop P1` |
| `highscore` | Zeigt die zehn besten Abschlusszeiten einer Phase. Phasen-IDs werden ohne Beachtung der Groß-/Kleinschreibung erkannt. | `highscore p1` |

## Spielphase

Die Mission liegt getrennt vom Terminal-Code in `game-data.js`. Sie enthält Aufgaben mit ID, Beschreibung und Hilfe. `game.js` verwaltet den aktuellen Fortschritt und informiert die ptuX-KI im Panel „PTuX-KI“.

Die Aufgaben werden nur durch erfolgreiche Aktionen erfüllt:

| Phase | Aufgaben | Abschlussbedingung |
| --- | --- | --- |
| P1 | Server installieren, per SSH anmelden, Server absichern und zwei weitere Server einrichten | Mindestens 3 installierte Server mit aktiver Firewall und fail2ban |

Die simulierten Admin-Aktionen erzeugen keine echten Prozesse und verändern keinen Host. Script-Aufrufe und Ausgaben werden im Bereich „Code“ angezeigt.

Bei jeder PXE-Installation wird ein Konto `<hostname>admin` angelegt. Die Zugangsdaten werden im Info-Safe gespeichert. Für P1_A2 meldet man sich mit `ssh <hostname>admin@<hostname>` an und gibt das zugehörige Passwort an der verdeckten Abfrage ein.

Nach `start <Phase>` läuft zunächst ein neutraler zehnsekündiger Countdown. Danach beginnt ein dreiminütiger Phasentimer; in der letzten Minute wird er orange, nach Ablauf zählt er rot in der Überzeit weiter. `stop <Phase>` setzt nur den Timer zurück und erhält die aktuelle Aufgabe für zeitloses Üben; dieser Durchlauf wird nicht in den Highscore übernommen. Beim regulären Abschluss wird die Laufzeit als Ergebnis gespeichert. Die zehn schnellsten Ergebnisse jeder Phase bleiben auch nach `reset simulation` im Browser erhalten.

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
