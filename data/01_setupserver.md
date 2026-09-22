Ziel: Simulierte Installation eines remote Linux-Servers
Zielgruppe: Schüler der Oberstufe Gymnasium

Installiertes Betriebssystem: "ptuXOS" mit debian-Syntax

Die Schüler sollen nicht die Original-Befehle in das Terminal eingeben, sondern abstrakte Befehle, welche ein vorbereitetes bash-Script ausführt.

Der Code des simulierten Bash-Scripts und die simulierte Ausgabe des Terminals soll links im Container "Code" angezeigt werden. Die Ausgabe soll zeilenweise erfolgen. Wenn das Code-Fenster voll ist, soll der neue Code in der letzten Zeile eingefügt und der bisherige Code nach oben verschoben werden.

---

Bash-Script 1: Server installieren

Füge den Befehl "installserver <os> <ipaddress> <hostname> <Rechenzentrum>" in die Terminal-Simulation ein.

Beispiel: "installserver ptuXOS 134.128.32.5 server01 Oldenburg"

Ausgabe im Container "Code": Erstelle einen simulierten Terminal-Code, mit welchem auf einem Server der PXE-Boot-Mechanismus angeworfen wird und mit welchem die fiktive Distribution "ptuXOS" installiert wird. Die Installation soll 30 Sekunden dauern.

Nach der Installation:

Suche in Datei /map-data/worldcities.json nach der eingegebenen Stadt beim Parameter "Rechenzentrum" und zeige auf der Weltkarte die Stadt mit einem hellblauen gefüllten Kreis an (Sinnvolle Größe des Kreises relativ zur Fenstergröße)

Zeige im Fenster "Infos" dauerhaft Informationen zum neuen Server an

Hostname - IP-Adresse - OS - Stadt - Lat, Lon

---

Bash-Script 2: sudo User anlegen

Füge den Befehl "addsuperuser <username> <password>" in die Terminal-Simulation ein.

Besipiel: "addsuperuser pt 1234"

Ausgabe im Container "Code": Erstelle einen simulierten Terminal-Code, mit welchem ein sudo-User angelegt wird.

Beispiel:

    useradd pt
    passwd pt 1234
    usermod -aG sudo pt

Simuliere die Ausgabe des Terminals entsprechend.

---