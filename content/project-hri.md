Ein umfassendes Mensch-Roboter-Interaktionssystem für den Vierbeiner-Roboter Unitree Go1, entwickelt im HRI-Modul (Human-Robot Interaction) an der HSLU. Das System ermöglicht natürliche multimodale Interaktion durch Handgesten, Sprachbefehle und visuelle Personenverfolgung. Der Roboter kann einer ausgewählten Person folgen, auf deutsche Sprachbefehle («Sitz», «Auf», «Bei Fuss») reagieren und verschiedene Posen ausführen — auf Basis einer ROS2-Node-Architektur mit Sensorfusion.

<div class="project-links" style="margin-top: 20px; margin-bottom: 30px;">
    <a href="https://github.com/Luk-stud/HRI" class="btn btn-primary" target="_blank">
        <i class="fab fa-github"></i> Quellcode & Dokumentation
    </a>
</div>

## Demo-Videos

Der Unitree Go1 in Aktion — Personenverfolgung und Sitzfunktion:

<div class="video-container">
    <video controls width="100%">
        <source src="images/video_unitree_follow2.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
    <p class="image-caption">Demonstration der Personenverfolgung</p>
</div>

<div class="video-container">
    <video controls width="100%">
        <source src="images/Sitzfunktionalität.MOV" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
    <p class="image-caption">Sitzfunktion</p>
</div>

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## Systemarchitektur

Das System basiert auf ROS2 (Robot Operating System 2) und besteht aus mehreren vernetzten Nodes, die zusammen ein nahtloses Mensch-Roboter-Interaktionserlebnis ermöglichen. Alle Custom Nodes laufen auf einer Workstation und kommunizieren mit dem Unitree Go1 über Netzwerk-Topics. Der Roboter stellt drei zentrale Topics bereit: <code>/image</code> (Kamerastream), <code>/desired_pose</code> (Körperpositionen) und <code>/cmd_vel</code> (Bewegungsbefehle).

<div class="image-container">
    <a href="images/Architektur.png" target="_blank" style="display: block;">
        <img src="images/Architektur.png" alt="ROS2-Systemarchitektur" style="cursor: pointer;">
    </a>
    <p class="image-caption">Vollständige ROS2-Node-Architektur – alle Custom Nodes laufen auf der Workstation (klicken zum Vergrössern)</p>
</div>

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## State Machine Design

Der Sensor-Fusion-Node publiziert vier Aktionsbefehle: **SIT**, **UP**, **FOLLOW** und **STOP_FOLLOWING**. Die State Machine verarbeitet diese Befehle, aktualisiert ihren internen Zustand und publiziert den aktuellen State auf <code>/state_machine_out</code>. Strenge Übergangsregeln gewährleisten Systemstabilität:

<div class="image-container">
    <a href="https://raw.githubusercontent.com/Luk-stud/HRI/main/polygon_nav/Documentation/state_machine.png" target="_blank" style="display: block;">
        <img src="https://raw.githubusercontent.com/Luk-stud/HRI/main/polygon_nav/Documentation/state_machine.png" alt="State-Machine-Diagramm" onerror="this.style.display='none'" style="cursor: pointer;">
    </a>
    <p class="image-caption">State-Machine-Übergänge: IDLE → FOLLOW/SIT, FOLLOW → IDLE, SIT → IDLE (klicken zum Vergrössern)</p>
</div>

<ul class="feature-list">
    <li><strong>IDLE:</strong> Standardzustand. Der Roboter führt subtile Idle-Animationen aus. Akzeptiert FOLLOW (Übergang zu FOLLOW) und SIT-Befehle (Übergang zu SIT).</li>
    <li><strong>FOLLOW:</strong> Der Roboter verfolgt aktiv die ausgewählte Person. Akzeptiert nur STOP_FOLLOWING zur Rückkehr in IDLE.</li>
    <li><strong>SIT:</strong> Der Roboter nimmt eine Sitzposition mit interpolierten Gelenkbewegungen ein. Akzeptiert nur UP zur Rückkehr in IDLE.</li>
</ul>

Ungültige Übergänge (z. B. STOP_FOLLOWING im SIT-Zustand) werden abgelehnt, um Verwirrung durch Sensorrauschen zu vermeiden. Ein internes Flag verhindert doppelte Publikationen desselben Zustands. Nur gültige Zustandsänderungen lösen Aktionen aus — alle Übergänge werden normalisiert und validiert.

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0;">

## ROS2 Nodes

Das System besteht aus sieben spezialisierten ROS2 Nodes für Perception, Entscheidungsfindung und Steuerung:

### 1. YOLO Processor (yolo_processor.py)

Empfängt den Kamerastream und führt YOLOv8-Inferenz mit BYTETrack-Tracking durch. Jede erkannte Person erhält eine stabile Tracking-ID, die auch bei kurzen Verdeckungen erhalten bleibt. Der Node publiziert Bounding-Box-Koordinaten und Confidence Scores als <code>vision_msgs/Detection2DArray</code> auf <code>/yolo/detections</code>. Ein annotiertes Bild mit Boxen und IDs wird auf <code>/yolo/processed_image</code> zur Fehlersuche publiziert. Konfigurierbare Confidence Thresholds erlauben die Abstimmung zwischen Precision und Recall. BYTETrack sorgt für ID-Stabilität und verhindert Tracking-Sprünge.

### 2. Hand Gesture Detector (hand_gesture_detector.py)

Verarbeitet den Kamerastream mit MediaPipe Hands und extrahiert Landmarks beider Hände. Der Node erkennt Zeigegesten (erhobener Zeigefinger) und Daumen-hoch-Signale und publiziert deren Pixelkoordinaten als <code>geometry_msgs/PointStamped</code> auf <code>/hand/pointer_finger</code> und <code>/hand/thumbs_up</code>. Ein annotiertes Bild mit Skelettlinien, Markern und Debug-Farben wird auf <code>/hand/annotated_image</code> publiziert. GPU-beschleunigtes MediaPipe hält die Latenz auch bei mehreren Händen niedrig.

### 3. Voice Recognition (vosk_mic_listener)

Bildet das Audio-Frontend des Systems. Beim Start werden alle verfügbaren Mikrofone durchsucht; bevorzugt wird das in <code>config.py</code> spezifizierte Samson Q2U USB-Mikrofon. Ein lokales Vosk-Sprachmodell wird mit konfigurierbarer Grammatik, Sample Rate und Modellpfad via ROS-Parameter geladen. Audiosamples werden mit PyAudio erfasst, durch KaldiRecognizer verarbeitet und als finale und partielle Transkripte auf <code>/voice_commands_log</code> publiziert.

Der Node erkennt mehrere Wake Words (z. B. «Snoopy», «Thomas»). Bei Erkennung wird ein 10-Sekunden-Befehlsfenster (<code>awaiting_command</code>) aktiviert. Darin sucht das System nach in <code>COMMANDS_AFTER_WAKE</code> definierten Phrasen und publiziert den entsprechenden normalisierten Token (z. B. <code>dog_up</code>, <code>dog_sit</code>) als <code>std_msgs/String</code> auf <code>/voice_commands</code>. So erreichen Sprachbefehle den Sensor-Fusion-Node deterministisch und mit Priorität.

### 4. Sensor Fusion (sensor_fusion.py)

Das «Gehirn» des Systems — kombiniert Handgesten, Sprachbefehle und Personenerkennungen zu einheitlichen Aktionsempfehlungen. Abonniert <code>/yolo/detections</code>, <code>/hand/pointer_finger</code>, <code>/hand/thumbs_up</code>, <code>/voice_commands</code> und YOLO-Bildausgabe.

**Gesture Duration Filtering:** Zeigt eine Person länger als 3 Sekunden auf eine erkannte Person, wird die entsprechende Bounding-Box-ID als Tracking-Ziel gespeichert. Zielkoordinaten werden auf <code>/human_tracker/target_person</code> publiziert. Ein anhaltendes Daumen-hoch (3+ Sekunden) löst STOP_FOLLOWING aus. Sprachbefehle wie «Sitz» oder «Auf» haben höchste Priorität und überschreiben Gesten.

Alle bestimmten Aktionen (FOLLOW, STOP_FOLLOWING, SIT, UP) werden als <code>std_msgs/String</code> auf <code>/fusion_out</code> publiziert. Timestamps, Timeouts und Buffer verhindern Fehlentscheidungen durch kurzes Gestenflackern. Ein Tracking-ID-System stellt sicher, dass nur die ausgewählte Person Befehle auslöst.

### 5. Follower Control (follower_control.py)

Wandelt den Zielpersonen-Stream der Sensorfusion in konkrete Bewegungsbefehle um. Abonniert <code>/state_machine_out</code> und ist nur im FOLLOW-State aktiv. Über <code>/human_tracker/target_person</code> erhält er Pixelposition und Boxhöhe als Distanzproxy. Horizontale Abweichung von der Bildmitte bestimmt die Winkelgeschwindigkeit, die Boxhöhe die Distanz. Eine <code>geometry_msgs/Twist</code>-Nachricht wird auf <code>/cmd_vel</code> publiziert; bei inaktivem FOLLOW wird sofort Nullgeschwindigkeit gesendet.

**PID Controller:** Zwei PID Controller für lineare und angular Kanäle. Gains (<code>kp_*</code>, <code>ki_*</code>, <code>kd_*</code>) und Limits wie <code>max_linear_speed</code> sind ROS-Parameter. Der lineare Controller ist auf Vorwärtsbewegung (0 bis max) beschränkt. Beide implementieren Anti-Windup durch Integralsättigung und Reset bei Zustandswechsel via <code>reset_controllers()</code>.

**Watchdog Timer:** Ein <code>target_timeout</code> überwacht, ob die Sensorfusion weiterhin Zielupdates liefert. Bei Ausbleiben stoppt der Roboter, die Controller werden zurückgesetzt, und das System wartet auf eine neue Bounding-Box-ID.

### 6. Pose Control (pose_control.py)

Übersetzt abstrakte State-Machine-Zustände in konkrete Körperposen für den Go1. Bei neuem State auf <code>/state_machine_out</code> führt pose_control die entsprechende Pose oder Animation aus. Im IDLE-State läuft eine subtile Idle-Schleife. Der Übergang zu SIT löst eine Interpolation in die Sitzposition aus. Bei FOLLOW kehrt der Roboter in eine neutrale Haltung zurück. Alle Pose-Befehle werden als <code>go1_legged_msgs/DesiredPose</code> auf <code>/desired_pose</code> publiziert.

### 7. State Machine (state_machine.py)

Verwaltet die Verhaltenszustände des Roboters durch Verarbeitung des Fusion-Outputs und Durchsetzung gültiger Übergänge. Akzeptiert nur vier normalisierte Aktionsstrings (FOLLOW, STOP_FOLLOWING, SIT, UP) und prüft sie gegen eine strenge Übergangstabelle. Ungültige Kombinationen werden abgelehnt. Nur tatsächliche Zustandsänderungen werden auf <code>/state_machine_out</code> publiziert.
