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
document.querySelectorAll(".card-cta").forEach(function (a) {
  a.addEventListener("click", function () {
    var pkg = a.dataset.package;
    if (vybrano) { vybrano.querySelector("b").textContent = pkg; vybrano.hidden = false; }
    var text = "Dobrý den, mám zájem o službu: " + pkg + ".\n\nFakturační údaje (jméno nebo název firmy, adresa, IČO, pokud ho mám):\n";
    if (mailLink) mailLink.href = "mailto:chmelar.david@outlook.com?subject=" + encodeURIComponent("Poptávka: " + pkg) + "&body=" + encodeURIComponent(text);
    if (waLink) waLink.href = "https://wa.me/420605186878?text=" + encodeURIComponent(text);
  });
});
