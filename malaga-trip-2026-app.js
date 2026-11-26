(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  try { var t = localStorage.getItem("malaga-trip-2026-theme"); if (t) root.setAttribute("data-theme", t); } catch (e) {}
  $("theme-toggle").addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("malaga-trip-2026-theme", next); } catch (e) {}
  });

  /* ---------- Eigene Fotos (optional) ----------
   Fotos in den Ordner "malaga-trip-2026-img/" legen und hier eintragen, z. B.
   "villa": "malaga-trip-2026-img/villa.jpg". Leer = Illustration bleibt. */
  var PHOTOS = {
    "villa": "",
    "tag-15": "", "tag-16": "", "tag-17": "", "tag-18": "", "tag-19": "", "tag-20": ""
  };
  Array.prototype.forEach.call(document.querySelectorAll(".ill[data-img]"), function (box) {
    var src = PHOTOS[box.getAttribute("data-img")];
    if (!src) return;
    var img = new Image();
    img.alt = ""; img.loading = "lazy";
    img.onload = function () { box.appendChild(img); };
    img.src = src;
  });

  /* ---------- Navigation (Kacheln -> Ansichten, per URL-Hash) ---------- */
  function route() {
    var name = (location.hash || "").replace(/^#\/?/, "") || "home";
    var view = $("view-" + name) || $("view-home");
    Array.prototype.forEach.call(document.querySelectorAll(".view"), function (v) { v.hidden = v !== view; });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();

  /* ---------- Packliste ---------- */
  var PACK = [
    { g: "Sport & Wellness", items: ["Sportsachen (Pilates, Bewegung)", "Badesachen für den Whirlpool", "Badehandtuch", "Sonnencreme"] },
    { g: "Schuhe & Outdoor", items: ["Schuhe mit Profil (Caminito del Rey)", "Bequeme Schuhe für die Altstadt", "Sonnenbrille & Mütze", "Kleiner Rucksack, Wasserflasche"] },
    { g: "Reise & Papiere", items: ["Ausweis/Reisepass", "Flugtickets / Bordkarten", "Führerschein (Mietwagen)", "Buchungsbestätigungen (Weinprobe, Restaurant, Caminito)", "Ladekabel & Adapter", "Kleidung für Abende (Dezember: auch eine Jacke)"] }
  ];
  var PK = "malaga-trip-2026-packlist";
  function packState() { try { return JSON.parse(localStorage.getItem(PK) || "{}"); } catch (e) { return {}; } }
  function savePack(s) { try { localStorage.setItem(PK, JSON.stringify(s)); } catch (e) {} }
  function renderPack() {
    var st = packState(), h = "";
    PACK.forEach(function (grp, gi) {
      h += '<div class="pack-group"><h3>' + esc(grp.g) + "</h3>";
      grp.items.forEach(function (it, ii) {
        var id = "pk-" + gi + "-" + ii;
        h += '<label class="pack-item"><input type="checkbox" data-id="' + id + '"' + (st[id] ? " checked" : "") + "><span>" + esc(it) + "</span></label>";
      });
      h += "</div>";
    });
    $("pack-list").innerHTML = h;
  }
  $("pack-list").addEventListener("change", function (e) {
    var id = e.target.getAttribute("data-id"); if (!id) return;
    var st = packState(); st[id] = e.target.checked; savePack(st);
  });
  $("pack-reset").addEventListener("click", function () { savePack({}); renderPack(); });
  renderPack();

  /* ---------- Wetter (Open-Meteo) ---------- */
  var WMO = { 0: ["☀️", "Klar"], 1: ["🌤️", "Überwiegend klar"], 2: ["⛅", "Teils bewölkt"], 3: ["☁️", "Bedeckt"], 45: ["🌫️", "Nebel"], 48: ["🌫️", "Reifnebel"],
    51: ["🌦️", "Nieselregen"], 53: ["🌦️", "Nieselregen"], 55: ["🌧️", "Starker Nieselregen"], 61: ["🌧️", "Leichter Regen"], 63: ["🌧️", "Regen"], 65: ["🌧️", "Starkregen"],
    71: ["🌨️", "Schnee"], 73: ["🌨️", "Schnee"], 75: ["🌨️", "Schnee"], 80: ["🌦️", "Schauer"], 81: ["🌧️", "Schauer"], 82: ["⛈️", "Heftige Schauer"], 95: ["⛈️", "Gewitter"], 96: ["⛈️", "Gewitter"], 99: ["⛈️", "Gewitter"] };
  function wmo(c) { return WMO[c] || ["🌡️", "Wetter"]; }
  var TRIP = ["2026-12-16", "2026-12-17", "2026-12-18", "2026-12-19", "2026-12-20"];
  var URL = "https://api.open-meteo.com/v1/forecast?latitude=36.72&longitude=-4.42&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=16&timezone=Europe%2FMadrid";
  function dayCard(d, i, daily, trip) {
    var w = wmo(daily.weather_code[i]);
    var dt = new Date(d + "T12:00:00");
    var p = daily.precipitation_probability_max[i];
    return '<div class="wday' + (trip ? " trip" : "") + '"><div><b>' + esc(dt.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })) + '</b></div><div class="ic">' + w[0] + "</div><div>" +
      Math.round(daily.temperature_2m_max[i]) + "° / " + Math.round(daily.temperature_2m_min[i]) + "°</div><div class=\"muted small\">" + esc(w[1]) + (p != null ? " · " + p + "% Regen" : "") + "</div></div>";
  }
  function loadWeather() {
    fetch(URL).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      var c = j.current, w = wmo(c.weather_code);
      $("weather-now").innerHTML = '<span class="big">' + w[0] + " " + Math.round(c.temperature_2m) + "°C</span><br>" + esc(w[1]) + " · gefühlt " + Math.round(c.apparent_temperature) +
        "° · Wind " + Math.round(c.wind_speed_10m) + " km/h · Luftfeuchte " + c.relative_humidity_2m + "%";
      $("tile-weather-sub").textContent = "Jetzt " + Math.round(c.temperature_2m) + "°C · " + w[1];
      var dl = j.daily, trip = "", rest = "", found = 0;
      dl.time.forEach(function (d, i) {
        if (TRIP.indexOf(d) !== -1) { trip += dayCard(d, i, dl, true); found++; }
        else if (rest.split("wday").length < 7) rest += dayCard(d, i, dl, false);
      });
      $("weather-trip").innerHTML = trip || '<p class="muted">Noch keine Daten für diese Tage.</p>';
      $("weather-days").innerHTML = rest;
      Array.prototype.forEach.call(document.querySelectorAll(".wchip[data-date]"), function (chip) {
        var i = dl.time.indexOf(chip.getAttribute("data-date"));
        if (i === -1) return;
        var cw = wmo(dl.weather_code[i]);
        chip.textContent = cw[0] + " " + Math.round(dl.temperature_2m_max[i]) + "° / " + Math.round(dl.temperature_2m_min[i]) + "° · " + cw[1];
        chip.classList.remove("pending");
      });
      var note = $("weather-note");
      if (found < TRIP.length) {
        note.hidden = false;
        note.textContent = found === 0
          ? "Die Vorhersage (max. 16 Tage) reicht noch nicht bis zum 16.–20.12.; sie erscheint hier automatisch, sobald sie verfügbar ist."
          : "Für einen Teil der Reisetage liegt noch keine Vorhersage vor; sie ergänzt sich automatisch.";
      } else note.hidden = true;
      $("weather-updated").textContent = "Stand: " + new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr";
    }).catch(function () {
      $("weather-now").textContent = "Wetter konnte nicht geladen werden. Neuer Versuch in 10 Minuten.";
    });
  }
  loadWeather();
  setInterval(loadWeather, 10 * 60 * 1000);

  /* ---------- Wunschliste ---------- */
  var store = window.MalagaTrip2026WishesStore;
  $("store-mode").textContent = store.mode === "supabase"
    ? "Alle Wünsche werden gemeinsam gespeichert und sind für alle sichtbar."
    : "Hinweis: Aktuell werden Wünsche nur in diesem Browser gespeichert (lokaler Modus).";
  function renderWishes() {
    store.list().then(function (rows) {
      $("wish-list").innerHTML = rows.length ? rows.map(function (r) {
        return '<li><span class="who">' + esc(r.name) + "</span>" + (r.category ? ' <span class="tag">' + esc(r.category) + "</span>" : "") + "<br>" + esc(r.wish) + "</li>";
      }).join("") : '<li class="muted">Noch keine Wünsche – sei die/der Erste!</li>';
    }).catch(function () { $("wish-list").innerHTML = '<li class="muted">Wünsche konnten nicht geladen werden.</li>'; });
  }
  $("wish-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var w = { name: $("wish-name").value.trim(), wish: $("wish-text").value.trim(), category: $("wish-cat").value };
    if (!w.name || !w.wish) return;
    $("wish-msg").textContent = "Speichere …";
    store.add(w).then(function () {
      $("wish-msg").textContent = "Danke, dein Wunsch ist eingetragen! 🎉";
      $("wish-text").value = ""; renderWishes();
    }).catch(function () { $("wish-msg").textContent = "Fehler: Der Wunsch konnte nicht gespeichert werden."; });
  });
  renderWishes();
})();
