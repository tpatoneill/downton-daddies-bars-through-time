/* shots-allmaps.js — render a frame of every registered map (DESIGN QA req d). */
const { loadGame, advanceUntil, isWorld } = require('./qa.js');
const { shoot } = require('./shots.js');
const h = loadGame(); const { G } = h;
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000);
// full party + all "seen/arrived/joined/beaten" flags so onEnter cutscenes/bosses don't fire
G.Game.party = [G.makeFighter('samuel', 15), G.makeFighter('herschel', 15), G.makeFighter('william', 15), G.makeFighter('rosalind', 15)];
['act0_intro','act0_tutorial','rome_unlocked','rome_arrived_seen','rome_done','maximvs_beaten','herschel_joined',
 'dodge_unlocked','west_arrived_seen','drygulch_seen','train_at_station','ticket_bought','train_departed',
 'robbery_started','train_robbery_done','train_arrived','dodge_city_reached','dodge_press','dodge_done','jake_beaten','william_joined',
 'nyc_unlocked','nyc_arrived_seen','nyc_done','rex_beaten','rosalind_joined',
 'london_unlocked','finale_arrived','editor1_beaten','editor2_beaten','lobby_clear','snob1_beaten','finale_done','game_complete',
 'babbage_moved', 'sc_password', 'sc_inside', 'sc_briefed', 'sc_elevator_key', 'sc_show_seen'].forEach(f => G.setFlag(f));
const spawns = {
  manor: [7, 8], bakersrow: [9, 5], theatre: [7, 8],
  forum: [8, 5], marketroad: [9, 4], kitchens: [7, 7], arena: [6, 8],
  desertspawn: [3, 4], drygulch: [8, 5], station: [7, 4], traincar: [7, 3], baggagecar: [3, 3], mainstreet: [10, 6],
  theatredistrict: [9, 5], finalstage: [7, 8]
};
let n = 0;
for (const id in G.Maps) {
  const m = G.Maps[id];
  const sp = spawns[id] || [Math.min(m.w - 2, (m.w / 2) | 0), Math.min(m.h - 2, (m.h / 2) | 0)];
  G.Game.map = id; G.Game.px = sp[0]; G.Game.py = sp[1]; G.Game.dir = 'down';
  G.setScene(G.World);
  // if a cutscene fired anyway, skip it
  h.step(2);
  if (G.getScene() !== G.World) { advanceUntil(h, isWorld, 2000, id); }
  h.step(2);
  const num = String(++n).padStart(2, '0');
  shoot(h, 'map-' + num + '-' + id);
}
console.log('rendered ' + n + ' maps');
