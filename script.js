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
