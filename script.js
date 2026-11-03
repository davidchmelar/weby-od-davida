// D.CH Weby od Davida – funkce webu
// Mobilní menu
var header = document.querySelector("header");
var menuBtn = document.getElementById("menu-btn");
function setMenu(open) {
  header.classList.toggle("open", open);
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
    for (var i = 0; i < fSluzba.options.length; i++) {
      if (fSluzba.options[i].text === pkg) { fSluzba.selectedIndex = i; break; }
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
  document.querySelectorAll(".perk, .why > div, .work, .mini-prices a, .steps li, .about, .price, .mcard, .cta-in, .info, .case").forEach(function (el) {
    if (el.getBoundingClientRect().top < vh) return;
    var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty("--d", Math.min(idx, 3) * 0.08 + "s");
    el.classList.add("reveal");
    io.observe(el);
  });
})();
