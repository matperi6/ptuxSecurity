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
| `which` | Gibt einen simulierten Pfad für einen Befehl aus. | `which ls` |
| `exit` | Gibt `logout` aus; die Browser-Session bleibt geöffnet. | `exit` |

## Bedienung

- Mit `Enter` wird die aktuelle Eingabe ausgeführt.
- Mit `Pfeil hoch` und `Pfeil runter` wird durch die History navigiert.
- `Tab` vervollständigt bekannte Befehle und einfache Datei-/Verzeichnisnamen.
- `Strg+C` bricht die aktuelle Eingabe ab.
- Die Quick-Commands links setzen einen Befehl direkt in das Terminal.

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
