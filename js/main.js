/* ============================================================
   MAOS shared scripts
   ============================================================ */

/* ---- CONTACT FORM DELIVERY ----------------------------------
   Server-delivered submissions use Web3Forms (free):
   1. Go to https://web3forms.com and enter manager@maos.co.za
   2. Copy the access key emailed to you
   3. Paste it between the quotes below
   Until a key is set, the form falls back to opening the
   visitor's email app (mailto) so no enquiry is ever lost.     */
const WEB3FORMS_ACCESS_KEY = "6f66daf6-40f2-4dc4-8ffd-0ca5d43377b1"; // <-- paste access key here

/* Mobile menu */
const menuBtn = document.getElementById('menuBtn');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', open);
  });
}

/* Footer year */
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

/* Years-since counters (e.g. years in practice since founding) */
document.querySelectorAll('[data-years-since]').forEach(el => {
  el.textContent = new Date().getFullYear() - +el.dataset.yearsSince;
});

/* Scroll reveal */
const revObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* Count-up stats */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el) {
  const target = +el.dataset.count, suffix = el.dataset.suffix || '';
  if (prefersReduced) { el.textContent = target + suffix; return; }
  const dur = 1200, start = performance.now();
  function tick(t) {
    const p = Math.min((t - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { countUp(e.target); statObs.unobserve(e.target); }
}), { threshold: .4 });
document.querySelectorAll('[data-count]').forEach(el => statObs.observe(el));

/* Claims run-off triangle (home hero signature) */
(function () {
  const g = document.getElementById('triGrid');
  if (!g) return;
  const rows = 8, size = 44, x0 = 8, y0 = 22, gap = 4;
  let cells = '';
  for (let r = 0; r < rows; r++) {
    const cols = rows - r;
    for (let c = 0; c < cols; c++) {
      const lit = (c === cols - 1);
      cells += `<rect class="tri-cell${lit ? ' lit' : ''}" x="${x0 + c * (size + gap)}" y="${y0 + r * (size / 1.55 + gap)}" width="${size}" height="${size / 1.55}" rx="4" style="transition:opacity .5s ${((r + c) * 45)}ms;opacity:0"/>`;
    }
  }
  g.innerHTML = cells;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    g.querySelectorAll('.tri-cell').forEach(el => el.style.opacity = '1');
  }));
})();

/* Contact form: Web3Forms POST, mailto fallback */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const f = this;
    if (!f.checkValidity()) { f.reportValidity(); return; }

    const payload = {
      name: f.name.value.trim(),
      organisation: f.org.value.trim(),
      email: f.email.value.trim(),
      topic: f.topic.value,
      message: f.msg.value.trim()
    };

    const status = document.getElementById('formStatus');
    const submitBtn = f.querySelector('button[type="submit"]');

    if (WEB3FORMS_ACCESS_KEY) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `Website enquiry — ${payload.topic} (${payload.organisation})`,
            from_name: payload.name,
            ...payload
          })
        });
        const json = await res.json();
        if (json.success) {
          status.textContent = 'Thank you — your enquiry has been sent. We will come back to you shortly.';
          status.style.display = 'block';
          f.reset();
        } else { throw new Error(json.message || 'Submission failed'); }
      } catch (err) {
        status.textContent = 'Sending failed — opening your email app instead.';
        status.style.display = 'block';
        openMailto(payload);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send enquiry';
      }
    } else {
      openMailto(payload);
    }
  });
}
function openMailto(p) {
  const subject = `Website enquiry — ${p.topic} (${p.organisation})`;
  const body = [`Name: ${p.name}`, `Organisation: ${p.organisation}`, `Email: ${p.email}`, `Interested in: ${p.topic}`, '', p.message].join('\n');
  window.location.href = 'mailto:manager@maos.co.za?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}
