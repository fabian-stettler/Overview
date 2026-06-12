<div class="project-links" style="margin-bottom: 3rem;">
    <a href="HSLU_I_WIPRO_HS25_Stettler_Arnet_Final.pdf" class="btn btn-primary" download>
        <i class="fas fa-file-pdf"></i> Vollständige Dokumentation herunterladen
    </a>
    <a href="https://github.com/fabian-stettler/mlat-server-wiedehopf-wipro" class="btn btn-secondary" target="_blank">
        <i class="fab fa-github"></i> Server-Repository
    </a>
    <a href="https://github.com/fabian-stettler/mlat-client" class="btn btn-secondary" target="_blank">
        <i class="fab fa-github"></i> Client-Repository
    </a>
</div>

## Übersicht

Dieses Projekt beschreibt Design, Implementierung und Evaluation einer Multilaterations-Infrastruktur (MLAT) zur Flugzeugortung in der Zentralschweiz. Das System ermöglicht die Positionsbestimmung von Flugzeugen anhand empfangener Transpondersignale — unabhängig von GPS-Daten. Dies ist besonders relevant für militärische Anwendungen und die Forschung im Bereich MLAT-Spoofing.

Entwickelt als WIPRO-Projekt an der Hochschule Luzern für den Auftraggeber Armasuisse (Bundesamt für Rüstung), bietet das System eine funktionale Grundlage für weitere Forschung in der Flugsicherheit und MLAT-Technologie.

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## Systemarchitektur

Die implementierte Infrastruktur besteht aus fünf geografisch verteilten Empfangsstationen an folgenden Standorten:

- **Rotkreuz** – HSLU-Campus, Installation auf dem Dach
- **Zürich** – ETH-Gebäude mit aktiver Antenne
- **Thun** – Armasuisse Cyber-Defence Campus
- **Emmen** – Homberg, erhöhte Position
- **Payerne** – Flughafenanlage mit 5G-Anbindung

Jede Empfangsstation basiert auf einem Raspberry Pi 4 mit RTL-SDR-Hardware und ADS-B-Antenne. Ein zentraler Server berechnet Flugzeugpositionen durch Triangulation mittels Time Difference of Arrival (TDOA)-Messungen von mehreren Stationen.

<div class="project-image-inline">
    <a href="images/Netzwerkdiagramm_WIPRO_v2_1.png" target="_blank" style="display: block;">
        <img src="images/Netzwerkdiagramm_WIPRO_v2_1.png" alt="MLAT-System-Deploymentsdiagramm" style="width: 100%; max-width: 900px; margin: 1.5rem auto; display: block; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;">
    </a>
    <p style="text-align: center; font-style: italic; color: #666; margin-top: 0.5rem;">Systemarchitektur mit Clients, Server und Datenfluss (klicken zum Vergrössern)</p>
</div>

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## Technische Implementierung

### Client-Stationen

Die Softwarekomponenten (readsb, mlat-client, tar1090) wurden mit Docker containerisiert — für effiziente Skalierung und Wartung. Wichtige Merkmale:

- **Signalempfang:** RTL-SDR-Dongles digitalisieren elektromagnetische Transpondersignale
- **Datenverarbeitung:** readsb wandelt I/Q-Rohdaten in gültige ADS-B-Nachrichten um
- **Echtzeit-Visualisierung:** tar1090-Webinterface zeigt verfolgte Flugzeuge
- **Remote-Zugriff:** Cloudflare-Tunnels ermöglichen sichere Fernverwaltung via HTTPS
- **Wetterschutz:** Outdoor-Stationen nutzen Schutzgehäuse

### Server-Komponente

Der MLAT-Server läuft auf einem Hetzner-VPS und basiert auf dem Open-Source-Repository von wiedehopf. Eine wesentliche Erweiterung war die Anpassung des Servers zur Multilateration sowohl unkoooperativer Mode-S-Signale als auch kooperativer ADS-B-Signale. Wichtige Merkmale:

- **Multi-Client-Support:** Verbindungen von mehreren verteilten Empfangsstationen
- **Triangulation-Engine:** Positionsberechnung via TDOA von 4+ Empfängern
- **BEAST-Format-Output:** Weiterleitung multilaterierter Positionen an das OpenSky Network
- **Skalierbarkeit:** VPS-Ressourcen können lastabhängig angepasst werden
- **Data Logging:** Umfassendes Logging für Analyse und Debugging

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## Ergebnisse & Evaluation

<div class="project-image-inline">
    <img src="images/Multilaterierte_Positionen.png" alt="Scatterplot multilaterierter Flugzeugpositionen" style="width: 100%; max-width: 900px; margin: 1.5rem auto; display: block; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="text-align: center; font-style: italic; color: #666; margin-top: 0.5rem;">Scatterplot multilaterierter Positionen – Rot: ADS-B-Signale, Blau: Mode-S-Signale</p>
</div>

<div class="project-image-inline">
    <img src="images/Heatmap_multilaterierte_Positionen.png" alt="MLAT-Abdeckungs-Heatmap der Schweiz" style="width: 100%; max-width: 900px; margin: 1.5rem auto; display: block; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="text-align: center; font-style: italic; color: #666; margin-top: 0.5rem;">Abdeckungs-Heatmap multilaterierter Flugzeugpositionen in der Schweiz</p>
</div>

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## Projektteam

**Studierende:** Dominik Arnet & Fabian Stettler  
**Auftraggeber:** Armasuisse W+T, Cyber-Defence Campus  
**Betreuer:** Chris Ditze-Stephan  
**Institution:** Hochschule Luzern, Departement Informatik
