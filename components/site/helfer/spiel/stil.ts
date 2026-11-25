/**
 * Stilregeln des Helfers. Farben, Ecken, Schatten und Schrift kommen aus den Werten der Seite
 * (--brand, --surface, --ink, --radius-…, --shadow-lg, --text-…), darum stimmen helles und dunkles Farbschema
 * ohne eigene Regeln. Keine Dauerschleifen: Jede Bewegung hier läuft einmal, ausgelöst durch eine Berührung.
 *
 * SCHATTEN_STIL gilt in der Schattenwurzel (Figur, Sprechblase, Staub, Tor und Korb),
 * LICHT_STIL im Dokument (Hülle und WhatsApp-Ball).
 */
export const SCHATTEN_STIL = `
.hf-feld{position:absolute;inset:0;pointer-events:none;overflow:hidden;font:inherit}
.hf-koerper{position:absolute;left:0;top:0;will-change:transform}
.hf-figur{width:0;height:0}
.hf-innen{position:absolute;left:0;top:0;width:620px;height:660px;transform-origin:0 0;pointer-events:none}
.hf-stand,.hf-wackel,.hf-lauf,.hf-oben,.hf-kopf,.hf-laufbild{position:absolute;left:0;top:0;width:620px;height:660px}
.hf-kopf{will-change:transform}
.hf-e{position:absolute;display:block;max-width:none;user-select:none;-webkit-user-drag:none;pointer-events:none}
.hf-augen{position:absolute;left:0;top:0;overflow:visible;pointer-events:none}
.hf-feld [hidden]{display:none!important}
.hf-knopf{all:unset;position:absolute;display:block;pointer-events:auto;cursor:grab;touch-action:none;border-radius:var(--radius-2);-webkit-tap-highlight-color:transparent}
.hf-knopf:active{cursor:grabbing}
.hf-knopf:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.hf-spiegel .hf-stand{transform:scaleX(-1);transform-origin:320px 330px}
.hf-links .hf-laufbild{transform:scaleX(-1);transform-origin:320px 330px}
.hf-winkt .hf-af-winken{animation:hf-winken .36s ease-in-out 4 alternate}
.hf-daumt .hf-af-daumen{animation:hf-ruck .3s ease-out}
.hf-wackelt-l .hf-wackel{animation:hf-wackeln-l .62s ease-out}
.hf-wackelt-r .hf-wackel{animation:hf-wackeln-r .62s ease-out}
.hf-schuettelt .hf-kopfhalter{animation:hf-schuetteln .56s ease-in-out}
.hf-poliert .hf-an-polieren{animation:hf-polieren 1s ease-in-out}
@keyframes hf-winken{from{transform:rotate(-11deg)}to{transform:rotate(11deg)}}
@keyframes hf-ruck{0%{transform:rotate(16deg)}60%{transform:rotate(-5deg)}100%{transform:rotate(0)}}
@keyframes hf-wackeln-l{0%{transform:rotate(0)}18%{transform:rotate(-9deg)}42%{transform:rotate(5deg)}66%{transform:rotate(-2.5deg)}100%{transform:rotate(0)}}
@keyframes hf-wackeln-r{0%{transform:rotate(0)}18%{transform:rotate(9deg)}42%{transform:rotate(-5deg)}66%{transform:rotate(2.5deg)}100%{transform:rotate(0)}}
@keyframes hf-schuetteln{0%,100%{transform:rotate(0)}20%{transform:rotate(-9deg)}45%{transform:rotate(8deg)}70%{transform:rotate(-5deg)}}
@keyframes hf-polieren{0%{transform:rotate(0)}12%{transform:rotate(-6deg)}24%{transform:rotate(5deg)}36%{transform:rotate(-6deg)}48%{transform:rotate(5deg)}60%{transform:rotate(-6deg)}78%{transform:rotate(-20deg)}100%{transform:rotate(0)}}
.hf-schatten{position:absolute;left:0;top:0;height:14px;margin-top:-7px;border-radius:var(--radius-voll);background:var(--ink);will-change:transform,opacity}
.hf-teil{pointer-events:none}
.hf-staub{position:absolute;width:var(--hf-gr,10px);height:var(--hf-gr,10px);margin:calc(var(--hf-gr,10px)/-2) 0 0 calc(var(--hf-gr,10px)/-2);border-radius:var(--radius-voll);background:var(--wand);opacity:.85;animation:hf-staub .6s ease-out forwards}
@keyframes hf-staub{to{transform:translate(var(--hf-dx,0),var(--hf-dy,-20px));opacity:0}}
.hf-blase{position:absolute;left:0;top:0;width:min(250px,calc(100vw - 16px));box-sizing:border-box;pointer-events:auto;background:var(--surface-raised);color:var(--ink);border:2px solid var(--brand);border-radius:var(--radius-2);padding:12px 14px;box-shadow:var(--shadow-lg);font-size:var(--text-callout);line-height:var(--text-callout--line-height)}
.hf-blase::after{content:"";position:absolute;left:var(--hf-spitze,50%);bottom:-10px;width:16px;height:16px;margin-left:-8px;background:var(--surface-raised);border-right:2px solid var(--brand);border-bottom:2px solid var(--brand);transform:rotate(45deg)}
.hf-text{margin:0 38px 0 0;font-weight:700}
.hf-aktionen{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.hf-aktionen:empty{display:none}
.hf-akt{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-height:var(--m-ziel,2.75rem);padding:0 12px;border-radius:var(--radius-2);border:2px solid var(--brand);color:var(--brand);font-weight:700;cursor:pointer;text-align:center}
.hf-akt:focus-visible,.hf-zu:focus-visible,.hf-mini:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.hf-zu{all:unset;position:absolute;right:2px;top:2px;width:var(--m-ziel,2.75rem);height:var(--m-ziel,2.75rem);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-voll);cursor:pointer;color:var(--ink)}
@media (hover:hover) and (pointer:fine){.hf-akt:hover{background:color-mix(in srgb,var(--brand) 10%,transparent)}.hf-zu:hover{background:color-mix(in srgb,var(--ink) 10%,transparent)}}
.hf-mini{all:unset;position:absolute;right:max(12px,env(safe-area-inset-right,0px));bottom:calc(max(12px,env(safe-area-inset-bottom,0px)) + var(--hf-unten,0px));width:56px;height:56px;border-radius:var(--radius-voll);pointer-events:auto;cursor:pointer;box-shadow:var(--shadow-lg)}
.hf-mini img{display:block;width:56px;height:56px;border-radius:var(--radius-voll)}
.hf-tor{position:absolute;width:78px;height:150px;box-sizing:border-box;border:5px solid var(--surface-raised);border-left:0;border-bottom:0;border-radius:0;outline:2px solid var(--ink);outline-offset:-1px;background:repeating-linear-gradient(45deg,color-mix(in srgb,var(--ink) 24%,transparent) 0 2px,transparent 2px 12px),repeating-linear-gradient(-45deg,color-mix(in srgb,var(--ink) 24%,transparent) 0 2px,transparent 2px 12px)}
.hf-korb{position:absolute;width:14px;height:100px;border-radius:var(--radius-1);background:var(--surface-raised);border:2px solid var(--ink);box-sizing:border-box}
.hf-korb::before{content:"";position:absolute;left:var(--hf-ring-x,12px);top:86px;width:var(--hf-ring,84px);height:10px;box-sizing:border-box;border:4px solid var(--vorlauf);border-radius:var(--radius-voll)}
.hf-korb::after{content:"";position:absolute;left:calc(var(--hf-ring-x,12px) + 6px);top:94px;width:calc(var(--hf-ring,84px) - 12px);height:44px;background:repeating-linear-gradient(60deg,color-mix(in srgb,var(--ink) 36%,transparent) 0 2px,transparent 2px 10px),repeating-linear-gradient(-60deg,color-mix(in srgb,var(--ink) 36%,transparent) 0 2px,transparent 2px 10px);clip-path:polygon(0 0,100% 0,82% 100%,18% 100%)}
`;

export const LICHT_STIL = `
[data-helfer]{position:fixed;inset:0;z-index:40;pointer-events:none}
.hf-ball-halter{position:fixed;left:0;top:0;z-index:41;will-change:transform}
.hf-ball-halter.hf-zieht{pointer-events:none}
.hf-ball{display:grid;place-items:center;width:100%;height:100%;border-radius:var(--radius-voll);background:var(--brand);color:var(--surface);box-shadow:var(--shadow-lg);cursor:grab;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-drag:none}
.hf-ball:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.hf-ball svg{display:block;pointer-events:none}
@media print{[data-helfer],.hf-ball-halter{display:none}}
`;
