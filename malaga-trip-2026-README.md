# Málaga-Trip 2026 – Dashboard

Statische Web-App (HTML/CSS/JS, kein Build) mit Programm, Wetter, Packliste, Sehenswürdigkeiten und Wunschliste.

## Dateien
| Datei | Zweck |
|---|---|
| `malaga-trip-2026-index.html` | Seite |
| `malaga-trip-2026-styles.css` | Design (hell/dunkel) |
| `malaga-trip-2026-app.js` | Wetter, Packliste, UI |
| `malaga-trip-2026-wishes-store.js` | Speicherschicht (localStorage oder Supabase) |
| `malaga-trip-2026-config.js` | Platzhalter-Konfiguration (wird von der Seite geladen) |
| `malaga-trip-2026-config.example.js` | Vorlage zum Kopieren |
| `malaga-trip-2026-supabase-schema.sql` | Tabelle + RLS für Supabase |

## Aufbau
Startseite mit Kacheln: Villa-Adresse, Tagesablauf (15.–20.12.) und Themen (Wetter, Packliste, Sehenswertes, Weihnachtsmärkte, Wunschliste, Villa & Mietwagen). Jede Kachel öffnet eine Ansicht über den URL-Hash (`#/tag-18`, `#/maerkte` …), alles in einer HTML-Datei.

## Bilder und Schrift
Der Ordner `malaga-trip-2026-assets/` gehört zur Seite und muss mit hochgeladen werden (neben der HTML-Datei). Er enthält verkleinerte Fotos (je 10–70 KB, freie Lizenzen von Wikimedia Commons, Nachweis im Seitenfuß unter „Bildnachweis“) und die Schrift „Kaushan Script“ (lokal eingebunden, keine Verbindung zu Google).

Eigene Fotos statt der Stockbilder (z. B. echtes Villa-Foto): Datei gleichen Namens in `malaga-trip-2026-assets/` ersetzen (z. B. `malaga-trip-2026-villa.jpg`, am besten ca. 560 px breit, unter 100 KB) oder den Pfad im Block `PHOTOS` in `malaga-trip-2026-app.js` ändern. Dann den Bildnachweis im Seitenfuß der HTML-Datei für dieses Bild anpassen/entfernen. Fehlt ein Foto, zeigt die Seite eine gezeichnete Illustration.

## In ein bestehendes Repo legen
Den kompletten Ordner `malaga-trip-2026-dashboard/` unverändert ins Repo kopieren (z. B. neben anderen Projekten). Alle Dateien haben das Präfix `malaga-trip-2026-`, die Pfade sind relativ – es wird nichts überschrieben und nichts anderes angefasst. Ist GitHub Pages im Repo schon aktiv, erreichst du die Seite einfach über den Unterpfad (siehe unten).

## Lokal testen
```powershell
cd malaga-trip-2026-dashboard
python -m http.server 8080
```
Dann `http://localhost:8080/malaga-trip-2026-index.html` öffnen.

## GitHub Pages
1. Ordner `malaga-trip-2026-dashboard/` ins bestehende Repo legen (alle Dateien tragen das Präfix `malaga-trip-2026-`, nichts wird überschrieben).
2. Committen und pushen.
3. Repo → Settings → Pages → Source: Branch (z. B. `main`), Ordner `/ (root)` → Speichern.
4. URL: `https://<user>.github.io/<repo>/malaga-trip-2026-dashboard/malaga-trip-2026-index.html`

## Supabase einrichten (Wunschliste für alle)
1. Projekt auf supabase.com anlegen.
2. SQL Editor → Inhalt von `malaga-trip-2026-supabase-schema.sql` einfügen → Run. (anon darf lesen und einfügen, nicht ändern/löschen.)
3. Project Settings → API: **Project URL** und **anon public key** kopieren.
4. In `malaga-trip-2026-config.js` (Vorlage: `…config.example.js`) `supabaseUrl` und `supabaseAnonKey` eintragen.
5. Neu laden: Die Seite zeigt „Alle Wünsche werden gemeinsam gespeichert“.

Hinweise:
- Der anon key ist öffentlich gedacht; die Sicherheit liegt in den RLS-Policies. **Nie** den `service_role`-Key eintragen.
- Jeder mit dem Link kann Wünsche eintragen (Spam möglich). Zum Aufräumen im Supabase-Dashboard löschen.
- Ohne gültige Config (Platzhalter) läuft automatisch der localStorage-Fallback (nur pro Gerät).
- supabase-js wird nur bei gültiger Config von jsDelivr geladen (Version 2.45.4, fest gepinnt).

## Noch zu ergänzen / zu prüfen
- Caminito: Abfahrt 8:15 ist ein Richtwert; Eingang und Shuttle-Zeiten laut Ticket.
- Öffnungszeiten der Sehenswürdigkeiten vor dem Besuch offiziell prüfen.
