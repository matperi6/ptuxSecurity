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
| `echo` | Gibt Text im Terminal aus. | `echo Hallo ptux` |
| `clear` | Leert den sichtbaren Terminal-Inhalt. | `clear` |
| `date` | Gibt Datum und lokale Uhrzeit aus. | `date` |
| `whoami` | Gibt den simulierten Benutzer aus: `guest`. | `whoami` |
| `hostname` | Gibt den simulierten Hostnamen aus: `ptux`. | `hostname` |
| `uname` | Gibt den Kernel-Namen aus; `-a` zeigt zusätzliche Simulationsdaten. | `uname -a` |
| `neofetch` | Zeigt eine kompakte Systemzusammenfassung. | `neofetch` |
| `tracert` | Simuliert eine zufällige Offline-Route über Westerstede, IXPs und ein zufälliges Ziel. | `tracert 132.45.32.231` |
| `which` | Gibt einen simulierten Pfad für einen Befehl aus. | `which ls` |
| `exit` | Gibt `logout` aus; die Browser-Session bleibt geöffnet. | `exit` |
| `installserver` | Simuliert die Installation eines ptuXOS-Servers an einem verfügbaren deutschen Rechenzentrum. | `installserver web01 ptuXOS München 51.68.33.30` |
| `addsuperuser` | Fügt einen simulierten Benutzer zur sudo-Gruppe hinzu. | `addsuperuser admin geheim` |

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
│   └── guest/
│       ├── desktop/
│       ├── documents/
│       ├── downloads/
│       └── readme.txt
├── tmp/
└── usr/
```
