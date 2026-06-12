AIRCH ist ein Robotikprojekt, das die präzise Platzierung eines Kunststoffrings auf eine Landeplattform mithilfe von Aruco-Markern (AprilTags) demonstriert. Das System kombiniert Computer Vision, Vorwärts- und Rückwärtskinematik sowie Echtzeit-Positionsregelung für autonome Pick-and-Place-Operationen.

<div class="project-links" style="margin-top: 20px; margin-bottom: 30px;">
    <a href="https://github.com/TobiFelder8/AIRCH" class="btn btn-primary" target="_blank">
        <i class="fab fa-github"></i> Quellcode & Dokumentation
    </a>
</div>

## Projektziel

Das Hauptziel bestand darin, einen Kunststoffring präzise auf eine Landeplattform zu platzieren. Die Herausforderung lag darin, die Zielplattform mithilfe von Aruco-Markern (AprilTags) zu erkennen und den Roboterarm so zu steuern, dass das Objekt durch Echtzeit-Bildverarbeitung, präzise Kinematikberechnungen und robuste Steuerungslogik exakt positioniert wird. Die Ladeplattform konnte sich deshalb innerhalb eines Kreissegments an einer beliebigen Position befinden — die Lösung funktioniert trotzdem.

![AIRCH Robot Setup](images/Bild_mycobot.png)

## Demo-Video

Hier ein Demo-Video, das zeigt, wie der Roboter den Ring exakt auf die vorgesehene Stelle legt:

<div class="video-container">
    <video controls width="100%">
        <source src="images/AIRCH_video.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
    <p class="image-caption">MyCobot Roboter platziert den Kunststoffring auf der Landeplattform</p>
</div>

<div class="project-links" style="margin-top: 30px;">
    <a href="https://github.com/TobiFelder8/AIRCH" class="btn btn-primary" target="_blank">
        <i class="fab fa-github"></i> Repository ansehen
    </a>
</div>

## Skizzierung des grundsätzlichen Lösungsansatzes

### Koordinatensysteme und Bezugssysteme
1. Pixelkoordinatensystem (2D)
Bild das von der Kamera produziert.

2. Weltkoordinatensystem
Befindet sich an der Base des Roboter.

3. Bezugssystem für Winkeltyp im Weltkoordinatensystem (θ1, θ2, θ3)

4. Winkel welche direkt die Anfahrtswinkel der drei Arme repräsentieren.
Regelungsloop zwischen Computer Vision und kinematische Armansteuerung (J1, J2, J3)


### Definition Forward und Inverse Kinematik

1. Forward Kinematics berechnet die Koordinaten im Weltkoordinatensystem, basierend auf momentanen Winkel des Roboters (J1, J2, J3) --> (x, y, z)

2. Inverse Kinematics berechnet die Roboterwinkel, aus den Weltkoordinaten.
(x, y, z) ---> (J1, J2, J3) 


### Regelungsloop zwischen Computer Vision und Gelenkansteuerung
1. Finden der Drop Zone in Pixel mithilfe der drei April Tags

2. Finden des Vektors, welcher die Verschiebung in 2d (XY Ebene) hin zum Zentrum beschreibt. Dieser Vektor hat die Einheit mm und nicht mehr Pixelkoordinaten

3. Drehen dieses Vektors anhand der momentanen Ausrichtung des Armes, sodass es kompatible Weltkoordinaten sind.

4. Offset zwischen Kamera und Tool Tip berücksichtigen. Es soll nicht die Kamera an diesem Ort landen sondern der Tool Tip.

5. Momentane Kameraposition in Weltkoordinaten auf Basis der Roboterwinkel berechnen (Forward Kinematics).Danach Normierter Vektor mit fixer Schrittweite skalieren und von momentaner Position subtrahieren.

6. Die dadurch entstandene Weltkoordinatenposition mit Inverse Kinematics in Roboterwinkel umrechnen und fahren. Z-Komponente wird immer gleich erniedrigt, bis sie auf einem Hoover Level angekommmen ist, wo diese nicht mehr ernieddrigt wird

7. Loop wiederholen

8. Wenn der Fehler Threshold genügend klein ist, wird der Endpunkt angefahren als Delta zwischen momentanen und Zielpunkt.

### Genauere mathematische Beschreibung der 8 Schritte

#### Schritt 1 — Drop Zone in Pixeln finden (Homographie-Rückprojektion)

Für jeden erkannten Tag liefert der ArUco-Detektor die 4 Eckpixel im Bild:

$$c = \{(u_0,v_0),\,(u_1,v_1),\,(u_2,v_2),\,(u_3,v_3)\} \quad [\text{px}]$$

Aus den bekannten kanonischen Koordinaten (Tag als unverzerrtes Quadrat mit physischer Seitenlänge $s = 31.3\,\text{mm}$):

$$\text{src} = \{(0,0),\,(s,0),\,(s,s),\,(0,s)\}$$

wird die Homographie-Matrix $H \in \mathbb{R}^{3\times3}$ berechnet:

$$H = \texttt{getPerspectiveTransform}(\text{src},\, c)$$

$H$ bildet jeden Punkt aus dem kanonischen Tag-Raum auf Bildpixel ab — inklusive Rotation, Skalierung und Perspektivverzerrung. Der Board-Mittelpunkt liegt je nach Tag-Rolle um $r = 47.6\,\text{mm}$ vom Tag-Zentrum $(s/2,\, s/2)$ versetzt:

$$\mathbf{p}_{\text{local}} = \begin{cases}(s/2 - r,\; s/2) & \text{id\_left} \\ (s/2 + r,\; s/2) & \text{id\_right} \\ (s/2,\; s/2 + r) & \text{id\_below}\end{cases}$$

Projektion in Bildpixel via projektiver Transformation:

$$\begin{pmatrix}u' \\ v' \\ w\end{pmatrix} = H \cdot \begin{pmatrix}p_x \\ p_y \\ 1\end{pmatrix}, \qquad (u_{\text{drop}},\, v_{\text{drop}}) = \left(\frac{u'}{w},\, \frac{v'}{w}\right)$$

Mittelwert über alle $N$ sichtbaren Tags:

$$(\bar{u},\, \bar{v}) = \frac{1}{N}\sum_{i=1}^{N}(u_{\text{drop},i},\, v_{\text{drop},i}) \quad [\text{px}]$$

---

#### Schritt 2 — Verschiebungsvektor in mm (Pixelfehler → mm im Kamerarahmen)

Pixel-Fehlervektor relativ zur Bildmitte $\bigl(c_x, c_y\bigr) = \bigl(\tfrac{W-1}{2}, \tfrac{H-1}{2}\bigr)$:

$$\Delta u = \bar{u} - c_x, \qquad \Delta v = \bar{v} - c_y \quad [\text{px}]$$

Exponentieller gleitender Mittelwert (EMA, $\alpha = 0.5$) zur Rauschreduktion:

$$\mathbf{e}_{\text{px}}^{(k)} = (1-\alpha)\,\mathbf{e}_{\text{px}}^{(k-1)} + \alpha\,(\Delta u,\, \Delta v)$$

Massstab $[\text{mm/px}]$ aus der physisch bekannten Tag-Kantenlänge (wird laufend aktualisiert):

$$\rho = \frac{s}{\bar{l}_{\text{px}}}$$

wobei $\bar{l}_{\text{px}}$ der mittlere Pixelabstand der vier Tag-Kanten ist. Umrechnung in mm im Kamerarahmen:

$$d_x^{\text{cam}} = e_u \cdot \rho \cdot \sigma_x, \qquad d_y^{\text{cam}} = e_v \cdot \rho \cdot \sigma_y$$

mit den Skalierungsparametern $\sigma_x, \sigma_y$ (Standardwert $0.5$, empirisch kalibriert).

---

#### Schritt 3 — Rotation in Weltkoordinaten

Der Kamera-Bildrahmen ist um den aktuellen Yaw-Winkel $\theta_1$ des Arms gedreht. Die 2D-Rotationsmatrix $R(\theta_1)$ transformiert den Fehlervektor vom Kamerarahmen in den Weltrahmen:

$$\begin{pmatrix}w_x \\ w_y\end{pmatrix} = \begin{pmatrix}\cos\theta_1 & -\sin\theta_1 \\ \sin\theta_1 & \cos\theta_1\end{pmatrix} \begin{pmatrix}d_x^{\text{cam}} \\ d_y^{\text{cam}}\end{pmatrix} \quad [\text{mm}]$$

Der skalare Betrag des Fehlers:

$$\varepsilon = \|\mathbf{w}\| = \sqrt{w_x^2 + w_y^2} \quad [\text{mm}]$$

---

#### Schritt 4 — Kamera-zu-Tool-Tip Offset

Die Kamera und der Tool-Tip sind zwei verschiedene physische Punkte am Arm — die Kamera sitzt $c_{\text{out}} = 57\,\text{mm}$ radial vor dem Tool-Tip. Da diese Richtung mit $\theta_1$ rotiert, ist der Offset im Weltrahmen:

$$\Delta x_{\text{cam}} = c_{\text{out}} \cdot \cos\theta_1, \qquad \Delta y_{\text{cam}} = c_{\text{out}} \cdot \sin\theta_1$$

Das Tool-Tip-Ziel ergibt sich aus dem Kameraziel durch Subtraktion des Offsets:

$$x_{\text{tool}} = x_{\text{cam,target}} - \Delta x_{\text{cam}}, \qquad y_{\text{tool}} = y_{\text{cam,target}} - \Delta y_{\text{cam}}$$

---

#### Schritt 5 — FK + normierter Schritt von aktueller Position

**Aktuelle Kameraposition per Vorwärtskinematik:**

Aus den ausgelesenen Gelenkwinkeln $(J_1, J_2, J_3)$ werden zuerst absolute Winkel berechnet:

$$\theta_1 = J_1, \quad \theta_2 = 90° - J_2, \quad \theta_3 = J_3 - 90°$$

Dann Vorwärtskinematik in Zylinderkoordinaten $(r, z)$, dann kartesische Projektion:

$$r_{\text{flange}} = a_2\cos\theta_2 + a_3\cos(\theta_2+\theta_3)$$

$$z_{\text{flange}} = d_1 + a_2\sin\theta_2 + a_3\sin(\theta_2+\theta_3)$$

$$x_{\text{cam}} = (r_{\text{flange}} + l_{\text{tool}} + c_{\text{out}})\cos\theta_1$$

$$y_{\text{cam}} = (r_{\text{flange}} + l_{\text{tool}} + c_{\text{out}})\sin\theta_1$$

**Normierter Schritt:**

Einheitsvektor in Fehlerrichtung:

$$\hat{\mathbf{u}} = \frac{\mathbf{w}}{\varepsilon} = \left(\frac{w_x}{\varepsilon},\, \frac{w_y}{\varepsilon}\right)$$

Schrittweite begrenzt auf $\delta_{\max} = 6\,\text{mm}$:

$$\delta = \min(\delta_{\max},\; \varepsilon)$$

Neues Kameraziel (das Minus kompensiert die OpenCV-Bildachse, bei der $v=0$ oben liegt und nach unten zunimmt):

$$\mathbf{x}_{\text{cam,target}} = \mathbf{x}_{\text{cam,current}} - \hat{\mathbf{u}} \cdot \delta$$

---

#### Schritt 6 — IK und Z-Abstieg

**Z-Abstieg** proportional zum Pixelfehler, bis Maximum $z_{\text{descend}}$ erreicht:

$$\text{descent\_factor} = \text{clip}\!\left(\frac{\varepsilon_{\text{px,start}} - \varepsilon_{\text{px}}}{\varepsilon_{\text{px,start}} - \varepsilon_{\text{px,full}}},\; 0,\; 1\right)$$

$$z_{\text{tip}} = z_{\text{tip,initial}} - \sum_k \delta_{z,k}$$

Z-Ziel für die IK (Tool-Tip-Z zuzüglich Endeffector-Offset):

$$z_{\text{IK}} = z_{\text{tip}} + d_{\text{EE}}$$

**Inverse Kinematik** — analytische Lösung via Kosinussatz:

$$\theta_1 = \text{atan2}(y,\, x)$$

$$r_w = \sqrt{x^2+y^2} - l_{\text{tool}}, \qquad z_w = (z_{\text{IK}} + h_{\text{tool}}) - d_1$$

$$c_3 = \frac{r_w^2 + z_w^2 - a_2^2 - a_3^2}{2\,a_2\,a_3}$$

$$\theta_3 = \text{atan2}\!\left(\sqrt{1-c_3^2},\; c_3\right)$$

$$\theta_2 = \text{atan2}(z_w,\, r_w) - \text{atan2}\!\left(a_3\sin\theta_3,\; a_2 + a_3\cos\theta_3\right)$$

Rückrechnung in robot-native Winkel und Senden über Serial:

$$J_1 = \theta_1, \quad J_2 = 90° - \theta_2, \quad J_3 = \theta_3 + 90° \;\xrightarrow{\text{Serial}}\; \text{Motor}$$

---


#### Schritt 8 — Konvergenz und Endpunkt

Konvergenzbedingung (alle müssen gleichzeitig erfüllt sein):

$$\varepsilon \leq \varepsilon_{\text{final}} \quad \text{für } n \geq 3 \text{ aufeinanderfolgende Frames}$$

$$\sum_k \delta_{z,k} \geq z_{\text{descend}} \quad \text{(Abstieg abgeschlossen)}$$

$$\text{Kalman fertig} \quad (\geq 5 \text{ Messungen verarbeitet})$$

Bei Konvergenz liefert FK die finale Tool-Tip-Position:

$$(x_{\text{drop}},\, y_{\text{drop}}) = \text{FK}_{\text{tip}}(\theta_1, \theta_2, \theta_3)$$

Danach werden statische Kamerabias-Korrekturen angewendet (einmalig empirisch kalibriert):

$$r = \sqrt{x^2+y^2}, \quad r' = r - c_{\text{inward}}$$

$$\begin{pmatrix}x' \\ y'\end{pmatrix} = \begin{pmatrix}\cos\phi & -\sin\phi \\ \sin\phi & \cos\phi\end{pmatrix}\begin{pmatrix}x \cdot r'/r \\ y \cdot r'/r\end{pmatrix}, \quad \phi = c_{\text{yaw\_bias}}$$

$(x', y')$ ist der finale Drop-Punkt — der Arm fährt dort auf $z_{\text{drop}}$ herunter und gibt das Objekt frei.
