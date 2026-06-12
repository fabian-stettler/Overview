## Projektübersicht

Im Rahmen des Moduls Software Design and Architecture (SWDA) wurde ein verteiltes Filialbestellsystem entwickelt.
Es soll eine Bestellplattform für eine Filiale ermöglichen, wo Kunden Artikel bestellen können, die im Lager der Filiale vorhanden sind.
Das System basiert auf einer Microservice-Architektur und ermöglicht die vollständige Verwaltung von Kunden,
Artikeln und Bestellungen in einem Filialkontext. Durch die Entkopplung der einzelnen Komponenten wird eine
hohe Flexibilität, Skalierbarkeit und Wartbarkeit gewährleistet.

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## Microservice-Architektur

Das System wurde bewusst als Microservice-Architektur konzipiert, um maximale Flexibilität und Unabhängigkeit
der einzelnen Komponenten zu erreichen. Jeder Service ist für einen spezifischen Geschäftsbereich verantwortlich
und kann unabhängig entwickelt, getestet und deployed werden.

### Service-Übersicht

<div class="service-grid">
    <div class="service-card">
        <h4><i class="fas fa-shield-alt"></i> Auth Service</h4>
        <p>Authentifizierung und Autorisierung mit JWT-Tokens. Verwaltung von Benutzern und rollenbasiertem Zugriff. Passwort-Hashing mit Bcrypt.</p>
    </div>
    <div class="service-card">
        <h4><i class="fas fa-users"></i> Customer Service</h4>
        <p>Vollständige Verwaltung der Kundendaten. Integration mit Dunning Service zur Prüfung von Mahnungen.</p>
    </div>
    <div class="service-card">
        <h4><i class="fas fa-box"></i> Inventory Service</h4>
        <p>Lagerverwaltung mit Artikelstammdaten, Bestandsführung und Mindestmengen-Überwachung. Implementiert Locks und Transaktionen für Datenkonsistenz.</p>
    </div>
    <div class="service-card">
        <h4><i class="fas fa-shopping-cart"></i> Order Service</h4>
        <p>Bestellverwaltung mit komplexem State-Management. Koordination zwischen Customer-, Inventory- und Restock-Service.</p>
    </div>
    <div class="service-card">
        <h4><i class="fas fa-truck"></i> Restock Service</h4>
        <p>Automatische Nachbestellung beim Zentrallager. Verwaltung von Lieferterminen und Bestandsaktualisierung.</p>
    </div>
    <div class="service-card">
        <h4><i class="fas fa-file-alt"></i> Business Log Service</h4>
        <p>Zentrale Protokollierung aller Geschäftsvorgänge. Filterbare Abfrage von Logs nach verschiedenen Kriterien.</p>
    </div>
    <div class="service-card">
        <h4><i class="fas fa-exclamation-triangle"></i> Dunning Service</h4>
        <p>Verwaltung und Prüfung von Kundenmahnungen. Schnittstelle zur Integration mit externen Mahnungssystemen.</p>
    </div>
    <div class="service-card">
        <h4><i class="fas fa-network-wired"></i> API Gateway</h4>
        <p>Zentraler Einstiegspunkt für alle Client-Anfragen. REST-API mit Routing zu den entsprechenden Services über RabbitMQ.</p>
    </div>
</div>

<div class="project-image" style="margin: 2rem 0;">
    <a href="images/Microservice_Architecture.png" target="_blank" style="cursor: pointer;">
        <img src="images/Microservice_Architecture.png" alt="Microservice Architektur Diagramm" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    </a>
    <p style="text-align: center; color: #666; font-size: 0.9rem; margin-top: 0.5rem;">(Klicken zum Vergrößern)</p>
</div>

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## Technische Implementierung

### Technologie-Stack

<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
    <ul style="margin: 0; padding-left: 1.5rem;">
        <li style="margin: 0.75rem 0;"><strong>Programmiersprache:</strong> Java 21</li>
        <li style="margin: 0.75rem 0;"><strong>Frameworks:</strong> Micronaut (Gateway), Hibernate (ORM)</li>
        <li style="margin: 0.75rem 0;"><strong>Message Broker:</strong> RabbitMQ für synchrone und asynchrone Kommunikation</li>
        <li style="margin: 0.75rem 0;"><strong>Datenbank:</strong> MySQL (jeder Service hat seine eigene Datenbankinstanz)</li>
        <li style="margin: 0.75rem 0;"><strong>Containerisierung:</strong> Docker, Docker Compose, Docker Swarm</li>
        <li style="margin: 0.75rem 0;"><strong>Testing:</strong> JUnit (Unit-Tests), Jest + Faker (System-Tests in TypeScript)</li>
        <li style="margin: 0.75rem 0;"><strong>API:</strong> REST-API über HTTP</li>
    </ul>
</div>

### Design Patterns

#### Adapter/Strategy Pattern für Service-Kommunikation

Für die Kommunikation zwischen Services wurde ein Adapter Pattern implementiert. Jeder Service definiert
Interfaces für die Kommunikation mit anderen Services. Diese können je nach Bedarf mit verschiedenen
Implementierungen (RabbitMQ, Mock für Tests) verwendet werden.

#### Strategy Pattern für Datenbankzugriffe

Der Datenbankzugriff wurde abstrahiert durch DAO-Interfaces. Diese werden sowohl mit Hibernate
als auch mit In-Memory-Implementierungen bereitgestellt, was das Testen ohne Datenbank ermöglicht.

### Concurrency Control

Im Inventory Service wurde ein ausgefeiltes Concurrency-Management implementiert:

- **ReentrantLocks:** Schutz kritischer Codeabschnitte bei gleichzeitigen Zugriffen
- **Thread-Safe DAOs:** Lock- und Unlock-Mechanismen auf DAO-Ebene

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## Teststrategie

### Unit-Tests

Jeder Microservice verfügt über umfassende Unit-Tests, die in der CI/CD-Pipeline automatisch ausgeführt werden:

- Mocking der RabbitMQ-Kommunikation für isolierte Service-Tests
- In-Memory-Implementierung der DAOs für datenbankfreies Testing
- Tests für kritische Geschäftslogik und Edge Cases

### System-Tests

In einem separaten TypeScript-Projekt wurden End-to-End-Tests implementiert:

- Vollständige Integration aller Services von Gateway bis Datenbank
- Realistische Szenarien wie Kundenerfassung, Bestelldurchführung, Lagerverwaltung
- TypeScript-Mapping der REST-API als Grundlage für zukünftige Web-Frontends
- Jest als Test-Framework mit Faker für Testdaten-Generierung

### Testing-Philosophie

Das Team entschied sich bewusst gegen manuelle Tests und setzte vollständig auf automatisierte Tests.
Diese Strategie ermöglichte es, alle Anforderungen und Akzeptanzkriterien systematisch abzudecken und
Regressionen frühzeitig zu erkennen.

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

### Projektteam

Das Projekt wurde von einem vierköpfigen Team entwickelt:

- Michael Joss
- Fabian Stettler
- Tobias Felder
- Robin Venetz

<div class="back-to-top">
    <a href="index.html">← Zurück zur Übersicht</a>
</div>
