// D.CH Weby od Davida – funkce webu
// Mobilní menu
var header = document.querySelector("header");
var menuBtn = document.getElementById("menu-btn");
function setMenu(open) {
  document.documentElement.style.setProperty("--hh", header.offsetHeight + "px");
  header.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  menuBtn.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
}
menuBtn.addEventListener("click", function () {
  setMenu(!header.classList.contains("open"));
});
document.querySelectorAll("#menu a").forEach(function (a) {
  a.addEventListener("click", function () { setMenu(false); });
});
// Zavření menu klávesou Escape nebo kliknutím mimo hlavičku
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && header.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
});
document.addEventListener("click", function (e) {
  if (header.classList.contains("open") && !header.contains(e.target)) setMenu(false);
});

// Rok v patičce
var rok = document.getElementById("rok");
if (rok) rok.textContent = new Date().getFullYear();

// Tlačítka Kopírovat
document.querySelectorAll(".copy").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var el = document.getElementById(btn.dataset.target);
    if (!el) return;
    var text = el.textContent.replace(/\u00a0/g, " ").trim();
    function show(msg) {
      btn.textContent = msg;
      setTimeout(function () { btn.textContent = "Kopírovat"; }, 1800);
    }
    function selectText() {
      var r = document.createRange(); r.selectNodeContents(el);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      show("Označeno, zkopírujte");
    }
    if (navigator.clipboard && window.isSecureContext !== false) {
      navigator.clipboard.writeText(text).then(function () { show("Zkopírováno"); }).catch(selectText);
    } else {
      selectText();
    }
  });
});

// Tlačítka v ceníku: vybraná služba se předvyplní do e-mailu a zprávy na WhatsApp
var vybrano = document.getElementById("vybrano");
var mailLink = document.querySelector('.act[href^="mailto:"]');
var waLink = document.querySelector('.act[href^="https://wa.me/"]');
var fSluzba = document.getElementById("f-sluzba");
function fillService(pkg) {
  if (!vybrano || !pkg) return;
  if (fSluzba) {
    // Méně možností ve formuláři: konkrétní balíček z ceníku se zařadí do jedné ze 3 skupin
    var skupiny = {
      "Jednostránkový web": "Nový web", "Prezentace do 3 stran": "Nový web", "Firemní web do 5 stran": "Nový web",
      "Úpravy webu": "Úpravy webu",
      "Správa firemního profilu na Googlu": "Správa webu nebo profilu na Googlu",
      "Měsíční správa webu": "Správa webu nebo profilu na Googlu",
      "Kompletní online péče": "Správa webu nebo profilu na Googlu"
    };
    var cil = skupiny[pkg] || pkg;
    for (var i = 0; i < fSluzba.options.length; i++) {
      if (fSluzba.options[i].text === cil) { fSluzba.selectedIndex = i; fSluzba.dataset.presne = pkg; fSluzba.dataset.skupina = cil; break; }
    }
  }
  pkg = String(pkg).slice(0, 80);
  vybrano.querySelector("b").textContent = pkg;
  vybrano.hidden = false;
  var text = "Dobrý den, mám zájem o službu: " + pkg + ".\n\nFakturační údaje (jméno nebo název firmy, adresa, IČO, pokud ho mám):\n";
  if (mailLink) mailLink.href = "mailto:dchweby@gmail.com?subject=" + encodeURIComponent("Poptávka: " + pkg) + "&body=" + encodeURIComponent(text);
  if (waLink) waLink.href = "https://wa.me/420605186878?text=" + encodeURIComponent(text);
}
// Tlačítka v ceníku vedou na stránku Kontakt s vybranou službou v adrese (kontakt.html?sluzba=...)
try { fillService(new URLSearchParams(location.search).get("sluzba")); } catch (e) {}
document.querySelectorAll(".card-cta").forEach(function (a) {
  a.addEventListener("click", function () { fillService(a.dataset.package); });
});

// Formulář rychlé poptávky: sestaví zprávu a otevře WhatsApp nebo e-mail
(function () {
  var form = document.getElementById("poptavka");
  if (!form) return;
  var chyba = document.getElementById("f-chyba");
  var via = "wa";
  form.querySelectorAll("button[data-via]").forEach(function (b) {
    b.addEventListener("click", function () { via = b.dataset.via; });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var jmeno = form.jmeno.value.trim();
    var obor = form.obor.value.trim();
    var sluzba = form.sluzba.value || "Ještě nevím, poraďte mi";
    if (form.sluzba.dataset.presne && form.sluzba.value === form.sluzba.dataset.skupina) sluzba = form.sluzba.dataset.presne;
    var zprava = form.zprava.value.trim();
    form.jmeno.setAttribute("aria-invalid", jmeno ? "false" : "true");
    form.zprava.setAttribute("aria-invalid", zprava ? "false" : "true");
    if (!jmeno || !zprava) {
      chyba.hidden = false;
      (jmeno ? form.zprava : form.jmeno).focus();
      return;
    }
    chyba.hidden = true;
    var text = "Dobrý den, posílám poptávku webu.\n\n" +
      "Jméno / firma: " + jmeno + "\n" +
      (obor ? "Obor: " + obor + "\n" : "") +
      "Služba: " + sluzba + "\n\n" + zprava;
    if (via === "mail") {
      location.href = "mailto:dchweby@gmail.com?subject=" + encodeURIComponent("Poptávka webu: " + jmeno) + "&body=" + encodeURIComponent(text);
    } else {
      window.open("https://wa.me/420605186878?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
  });
})();

// Menší hlavička při posunu a plynulé zobrazení sekcí
(function () {
  var hdr = document.querySelector("header");
  var small = false;
  function onScroll() {
    var y = window.scrollY;
    if (!small && y > 60) { small = true; hdr.classList.add("small"); }
    else if (small && y < 20) { small = false; hdr.classList.remove("small"); }
  }
  if (hdr) { window.addEventListener("scroll", onScroll, { passive: true }); onScroll(); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  var vh = window.innerHeight;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add("in");
      io.unobserve(el);
      setTimeout(function () { el.classList.remove("reveal", "in"); }, 1400);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".perk, .why > div, .work, .mini-prices a, .steps li, .about, .price, .mcard, .cta-in, .info, .case, .head-block, .faq details, .scope, .partner-box, .qform, .about-facts li").forEach(function (el) {
    if (el.getBoundingClientRect().top < vh) return;
    var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty("--d", Math.min(idx, 3) * 0.08 + "s");
    el.classList.add("reveal");
    io.observe(el);
  });
})();

// Animované pozadí: rozmazané skvrny a plující symboly z loga
(function () {
  var syms = [
    {c:"", l:6, s:56, t:22, d:0, r:35}, {c:"cu", l:18, s:40, t:26, d:-8, r:-30}, {c:"dt", l:28, s:18, t:18, d:-4, r:0},
    {c:"", l:40, s:34, t:24, d:-14, r:-45}, {c:"cu", l:55, s:58, t:28, d:-2, r:25}, {c:"dt", l:64, s:16, t:20, d:-10, r:0},
    {c:"", l:74, s:46, t:24, d:-18, r:50}, {c:"cu", l:86, s:36, t:26, d:-6, r:-20}, {c:"dt", l:94, s:14, t:18, d:-12, r:0},
    {c:"", l:12, s:30, t:20, d:-16, r:-40}
  ];
  function layer(host, count) {
    if (!host || host.querySelector(":scope > .bg-fx")) return;
    var fx = document.createElement("div");
    fx.className = "bg-fx";
    fx.setAttribute("aria-hidden", "true");
    var html = '<span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span>';
    var h = Math.max(host.offsetHeight, 400) + 120;
    syms.slice(0, count).forEach(function (o) {
      html += '<span class="sym ' + o.c + '" style="left:' + o.l + '%;--s:' + o.s + 'px;--t:' + o.t + 's;--d:' + o.d + 's;--r:' + o.r + 'deg;--h:' + h + 'px"></span>';
    });
    fx.innerHTML = html;
    host.insertBefore(fx, host.firstChild);
  }
  var hero = document.querySelector(".hero");
  if (hero) layer(hero, 10);
  else if (!document.querySelector(".contact")) layer(document.querySelector("main"), 8);
  document.querySelectorAll(".band-soft").forEach(function (el) { layer(el, 7); });
  layer(document.querySelector(".contact"), 6);
  layer(document.querySelector(".cta-in"), 6);
})();

// Plovoucí tlačítko „Chci web“ na mobilu
(function () {
  if (document.querySelector(".contact")) return; // na stránce Kontakt není potřeba
  var bar = document.createElement("div");
  bar.className = "mcta";
  bar.innerHTML = '<a class="mcta-main" href="/kontakt">Chci web <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
    '<a class="mcta-wa" href="https://wa.me/420605186878" target="_blank" rel="noopener" aria-label="Napsat na WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>';
  var hdr = document.querySelector("header");
  if (hdr && hdr.parentNode) hdr.parentNode.insertBefore(bar, hdr.nextSibling); else document.body.appendChild(bar);
  var cil = document.querySelectorAll(".cta-band, .site-foot, .err404");
  var vidim = 0;
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target._vidim = e.isIntersecting; });
      vidim = 0; cil.forEach(function (t) { if (t._vidim) vidim++; });
      update();
    }, { threshold: 0.05 });
    cil.forEach(function (t) { io.observe(t); });
  }
  function update() {
    var dost = window.scrollY > Math.min(520, window.innerHeight * 0.7);
    bar.classList.toggle("show", dost && !vidim);
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
})();
