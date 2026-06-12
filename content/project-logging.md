Dieses Projekt entstand im Rahmen des Moduls VSK (Verteilte Systeme) an der HSLU. Es handelt sich um ein verteiltes Logging-System, das Logging via TCP von mehreren Clients an einen zentralen Server ermöglicht. Zusätzlich gibt es einen Log-Viewer zur visuellen Darstellung der geloggten Daten auf dem Server.

<div class="project-links" style="margin-top: 20px; margin-bottom: 30px;">
    <a href="Dokumentation_VSK.pdf" class="btn btn-primary" download>
        <i class="fas fa-file-pdf"></i> Dokumentation herunterladen
    </a>
    <a href="https://github.com/fabian-stettler/distributed-logging-system-vsk" class="btn btn-secondary" target="_blank">
        <i class="fab fa-github"></i> Quellcode
    </a>
</div>

## Komponentendiagramm

Das System besteht aus mehreren Schlüsselkomponenten, die zusammen zuverlässige verteilte Logging-Funktionen bereitstellen. Jede Komponente ist unabhängig deploybar und skalierbar konzipiert.

<div class="image-container">
    <img src="images/Komponentendiagramm.92dd6de87ecc4a84c545.jpg" alt="Komponentendiagramm">
    <p class="image-caption">System-Komponentendiagramm</p>
</div>

## Hauptfunktionen

<ul class="feature-list">
    <li><strong>TCP/IP-Kommunikation:</strong> Zuverlässiges Netzwerkprotokoll für Client-Server-Kommunikation</li>
    <li><strong>Concurrent Processing:</strong> Gleichzeitige Verarbeitung mehrerer Client-Verbindungen</li>
    <li><strong>Zentrales Logging:</strong> Einheitlicher Punkt für Log-Aggregation und -Speicherung</li>
    <li><strong>Visual Log Viewer:</strong> Echtzeit-Visualisierung der geloggten Daten</li>
    <li><strong>Docker Deployment:</strong> Containerisierte Architektur für einfaches Deployment</li>
    <li><strong>Skalierbares Design:</strong> Architektur unterstützt horizontale Skalierung</li>
</ul>

## Verwendete Technologien

Das Projekt nutzt moderne Java-Technologien und folgt Best Practices für verteilte Systeme. Docker-Container gewährleisten konsistentes Deployment in verschiedenen Umgebungen, TCP/IP sorgt für zuverlässige Netzwerkkommunikation.
