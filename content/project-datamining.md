Dies ist mein erstes Data-Mining-Projekt, bei dem ich Daten von www.srf.ch — einer Schweizer Nachrichtenseite — extrahiert und systematisch analysiert habe. Mich interessierten Veröffentlichungszeiten von Artikeln, die Aufmerksamkeit für bestimmte Themen über die Zeit, Häufigkeit und Timing von Autoren sowie mögliche Verzerrungen (Biases) des Publishers bei bestimmten Themen. Das Projekt ist noch nicht abgeschlossen — es werden weiterhin Daten gesammelt.

<div class="project-links" style="margin-top: 20px; margin-bottom: 30px;">
    <a href="network_graph.html" class="btn btn-primary">
        <i class="fas fa-project-diagram"></i> Interaktiven Netzwerkgraphen ansehen
    </a>
    <a href="https://github.com/fabian-stettler/DataMining" class="btn btn-secondary" target="_blank">
        <i class="fab fa-github"></i> Quellcode
    </a>
</div>

Die relevanten HTML-Dateien habe ich mit einem Script auf meinem Raspberry Pi gesammelt, das einmal täglich die Zieldaten abgerufen hat. Inspiriert wurde ich von David Kriesels «Reversing Spiegel-Online».

## Docker-Container-Übersicht

Hier eine Übersicht des Datenanalyseprozesses und aller beteiligten Docker-Container. Docker habe ich wegen der Portabilität gewählt — entwickelt auf dem Laptop, ausgeführt auf dem Raspberry Pi.

<div class="image-container">
    <img src="images/Docker Architecture Overview.845ae20e97d3137310d2.png" alt="Datenanalyse-Übersicht">
    <p class="image-caption">Übersicht der Datenanalyse</p>
</div>

## Heatmap: Veröffentlichungszeiten von Artikeln

Ein erster Anwendungsfall analysiert die Veröffentlichungszeiten aller Artikel auf www.srf.ch. Es gibt 24 × 7 Zeitslots, denen alle Artikel zugeordnet werden. Je gelber ein Slot, desto mehr Artikel wurden in diesem Zeitraum veröffentlicht — für eine gezielte Analyse des Publikationsverhaltens.

<div class="image-container">
    <img src="images/PublicationHeatMap.7d096c2004c80c5f5c13.png" alt="Heatmap der Artikel-Veröffentlichungszeiten">
    <p class="image-caption">Heatmap der Artikel-Veröffentlichungszeiten</p>
</div>

## Sentiment Analysis mit AI

Ich habe auch eine Sentiment Analysis mit bestimmten Keywords durchgeführt und diese miteinander verglichen, um mögliche Verzerrungen der Zeitung zu finden. Dafür habe ich alle Absätze aller Artikel nach Keywords durchsucht. Enthält ein Absatz ein Keyword, wird er mit einem externen AI-Modell klassifiziert — als negativ, neutral oder positiv, mit einem Confidence Score. In der Analyse fliessen nur Absätze mit einem Score über 0,9 ein.

<div class="image-container">
    <img src="images/SentimentAnalysis.a5bd2880ce384bd56be2.png" alt="Sentiment Analysis">
    <p class="image-caption">Ergebnisse der Sentiment Analysis</p>
</div>

## Aspektanalyse über die Zeit

Dieses Diagramm zeigt die Menge und Entwicklung bestimmter Aspekte oder Keywords über die Zeit.

<div class="image-container">
    <img src="images/aspectAnalysisByTime.b9a765f0bc43ab95d2ab.png" alt="Aspektanalyse">
    <p class="image-caption">Keywords: Demokraten, Republikaner</p>
</div>

## Veröffentlichungen einzelner Autoren über die Zeit

Diese Funktion zeigt alle Artikel eines bestimmten Autors über die Zeit — zur Analyse des Publikationsverhaltens einzelner Autoren.

<div class="image-container">
    <img src="images/AuthorNachTimeline.58a78f6952877161bab6.png" alt="Autoren-Veröffentlichungs-Timeline">
    <p class="image-caption">Timeline der Autoren-Veröffentlichungen</p>
</div>

## Keyword Network Analysis

Ein interaktiver Netzwerkgraph, der Beziehungen zwischen Keywords und Themen in den analysierten Artikeln zeigt.
