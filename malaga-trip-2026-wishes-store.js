/*
 * Speicherschicht der Wunschliste. Die App kennt nur: list(), add(), mode.
 * Standard: localStorage. Mit gültiger Config: Supabase (supabase-js per CDN, feste Version).
 */
(function () {
  "use strict";
  var LS_KEY = "malaga-trip-2026-wishes";
  var SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
  var cfg = window.MALAGA_TRIP_2026_CONFIG || {};
  var configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey &&
    cfg.supabaseUrl.indexOf("DEIN-") === -1 && cfg.supabaseAnonKey.indexOf("DEIN-") === -1);

  function lsRead() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch (e) { return []; }
  }
  function lsWrite(arr) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); return true; } catch (e) { return false; }
  }

  var local = {
    mode: "local",
    list: function () { return Promise.resolve(lsRead().sort(function (a, b) { return b.created_at < a.created_at ? -1 : 1; })); },
    add: function (w) {
      var arr = lsRead();
      var item = { id: String(Date.now()) + Math.random().toString(16).slice(2, 6), name: w.name, wish: w.wish, category: w.category || null, created_at: new Date().toISOString() };
      arr.push(item);
      return lsWrite(arr) ? Promise.resolve(item) : Promise.reject(new Error("Speichern im Browser nicht möglich"));
    }
  };

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error("supabase-js nicht ladbar")); };
      document.head.appendChild(s);
    });
  }

  function makeSupabase() {
    var table = cfg.supabaseTable || "malaga_trip_2026_wishes";
    var clientP = loadScript(SUPABASE_CDN).then(function () {
      return window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    });
    return {
      mode: "supabase",
      list: function () {
        return clientP.then(function (c) {
          return c.from(table).select("id,name,wish,category,created_at").order("created_at", { ascending: false }).limit(200);
        }).then(function (r) { if (r.error) throw r.error; return r.data; });
      },
      add: function (w) {
        return clientP.then(function (c) {
          return c.from(table).insert({ name: w.name, wish: w.wish, category: w.category || null });
        }).then(function (r) { if (r.error) throw r.error; return w; });
      }
    };
  }

  window.MalagaTrip2026WishesStore = configured ? makeSupabase() : local;
})();
