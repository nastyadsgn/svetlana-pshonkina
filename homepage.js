"use strict";
const icons = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  medal:
    '<path d="M12 3.5 14.4 8l5 .8-3.6 3.5.8 5L12 15l-4.6 2.3.8-5-3.6-3.5 5-.8z"/><path d="M8.5 17.5 7 21.5l2.5-.8L12 22l2.5-1.3 2.5.8-1.5-4"/>',
  person:
    '<circle cx="10" cy="7.5" r="3.5"/><path d="M3.5 20.5v-1A5.5 5.5 0 0 1 9 14h2.5"/><path d="m14.5 18 2 2 4-4.5"/>',
};
document.querySelectorAll("[data-icon]").forEach((el) => {
  el.innerHTML = `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${icons[el.dataset.icon] || icons.arrow}</svg>`;
});
const menuTrigger = document.querySelector("[data-mobile]");
let activeNav = null,
  navTimer;
function closeNav(focus = false) {
  clearTimeout(navTimer);
  if (!activeNav) return;
  const trigger = activeNav.querySelector(".nav-toggle");
  trigger.setAttribute("aria-expanded", "false");
  activeNav.querySelector(".nav-panel").hidden = true;
  activeNav = null;
  if (focus) trigger.focus();
}
function positionNav(group) {
  const panel = group.querySelector(".nav-panel"),
    trigger = group.querySelector(".nav-toggle"),
    header = group.closest(".site-header");
  const h = header.getBoundingClientRect(),
    t = trigger.getBoundingClientRect();
  const width = panel.getBoundingClientRect().width;
  const left = Math.max(5, Math.min(t.left - h.left, h.width - width - 5));
  panel.style.left = `${left}px`;
  panel.style.top = `${t.bottom - h.top + 12}px`;
  panel.style.setProperty(
    "--anchor-x",
    `${t.left - h.left - left + t.width / 2}px`,
  );
  panel.style.maxHeight = `${Math.max(180, innerHeight - t.bottom - 28)}px`;
}
function openNav(group) {
  if (innerWidth < 720) return;
  clearTimeout(navTimer);
  if (activeNav !== group) closeNav();
  activeNav = group;
  group.querySelector(".nav-toggle").setAttribute("aria-expanded", "true");
  group.querySelector(".nav-panel").hidden = false;
  positionNav(group);
}
document.querySelectorAll(".nav-group").forEach((group) => {
  const t = group.querySelector(".nav-toggle");
  t.addEventListener("click", (e) => {
    if (activeNav === group && e.pointerType !== "mouse") closeNav();
    else openNav(group);
  });
  group.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") openNav(group);
  });
  group.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") navTimer = setTimeout(() => closeNav(), 180);
  });
  group.addEventListener("focusout", () =>
    setTimeout(() => {
      if (
        activeNav === group &&
        !group.contains(document.activeElement) &&
        !group.matches(":hover")
      )
        closeNav();
    }, 0),
  );
  t.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openNav(group);
      group.querySelector(".nav-panel a")?.focus();
    }
  });
});
document.addEventListener("pointerdown", (e) => {
  if (activeNav && !activeNav.contains(e.target)) closeNav();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && activeNav) {
    e.preventDefault();
    closeNav(true);
  }
});
addEventListener("resize", () => {
  if (activeNav) {
    if (innerWidth < 720) closeNav();
    else positionNav(activeNav);
  }
  if (innerWidth >= 720 && document.getElementById("mobile-menu")?.open)
    document.getElementById("mobile-menu").close();
});
const previousFocus = new WeakMap();
function showDialog(id, source) {
  const d = document.getElementById(id);
  if (!d) return;
  const old = source?.closest("dialog");
  const focus = old ? previousFocus.get(old) : source || document.activeElement;
  if (old?.open) old.close();
  closeNav();
  previousFocus.set(d, focus);
  d.showModal();
  if (id === "mobile-menu") menuTrigger?.setAttribute("aria-expanded", "true");
  const first = d.querySelector("[data-close]");
  first?.focus({ preventScroll: true });
}
document.querySelectorAll("dialog").forEach((d) => {
  d.addEventListener("close", () => {
    if (d.id === "mobile-menu")
      menuTrigger?.setAttribute("aria-expanded", "false");
    const target = previousFocus.get(d);
    if (target?.isConnected && !document.querySelector("dialog[open]"))
      target.focus({ preventScroll: true });
  });
  d.addEventListener("click", (e) => {
    if (e.target !== d) return;
    const b = d.getBoundingClientRect();
    if (
      e.clientX < b.left ||
      e.clientX > b.right ||
      e.clientY < b.top ||
      e.clientY > b.bottom
    )
      d.close();
  });
});

// Homepage interactions. The form is a preview and never transmits personal data.
const hpQ = (s, root = document) => root.querySelector(s),
  hpAll = (s, root = document) => [...root.querySelectorAll(s)];
function hpConsult(source) {
  source?.closest("dialog")?.close();
  closeNav();
  showDialog("consult-dialog", source);
  return;
  const target = hpQ("#consultation");
  target.scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "center",
  });
  hpQ("input[name=name]", target).focus({ preventScroll: true });
}
document.addEventListener("click", (event) => {
  const el = event.target.closest(
    '[data-consult],[data-mobile],[data-close],[data-gallery],[data-soon],a[href^="#"]',
  );
  if (!el) return;
  if (el.hasAttribute("data-close")) {
    el.closest("dialog")?.close();
    return;
  }
  if (el.hasAttribute("data-mobile")) {
    showDialog("mobile-menu", el);
    return;
  }
  if (el.hasAttribute("data-gallery")) {
    const g = hpQ("#gallery-dialog"), imgs = hpAll(".result-pair img", g);
    const before = el.dataset.before || "assets/ba-before.webp",
      after = el.dataset.after || "assets/ba-after.webp",
      title = el.dataset.title || "Подтяжка лица";
    imgs[0].src = before; imgs[1].src = after;
    imgs[0].alt = `${title}: до операции`; imgs[1].alt = `${title}: после операции`;
    imgs.forEach((im) => { im.removeAttribute("width"); im.removeAttribute("height"); });
    hpQ("#gallery-title", g).textContent = title;
    showDialog("gallery-dialog", el);
    return;
  }
  if (el.hasAttribute("data-consult")) {
    event.preventDefault();
    hpConsult(el);
    return;
  }
  if (el.hasAttribute("data-soon")) {
    event.preventDefault();
    showDialog("soon-dialog", el);
    return;
  }
  if (el.matches('a[href^="#"]')) {
    el.closest("dialog")?.close();
    closeNav();
  }
});
// Native radio inputs and validation remain keyboard and touch accessible.
hpAll(".hp-form").forEach((f) => f.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const status = hpQ(".hp-form-status", form);
  status.hidden = false;
  status.textContent =
    "Форма пока не подключена. Данные не отправлены. Для записи: +7 (977) 336-03-03.";
}));
const socialBrands = hpAll(".stage .messengers .brand-icon");
hpAll(".hp-contact-choice").forEach((group) => hpAll("label", group)
  .slice(1)
  .forEach((label, i) => {
    if (socialBrands[i]) {
      const svg = socialBrands[i].cloneNode(true);
      svg.classList.add("hp-channel-brand");
      hpQ("svg", label).replaceWith(svg);
    }
  }));
hpAll(".hp-service").forEach((card) => {
  const trigger = hpQ(".hp-service-top button", card);
  trigger.addEventListener("click", () => {
    const expanded = !card.classList.contains("is-open");
    hpAll(".hp-service").forEach((other) => {
      other.classList.remove("is-open");
      hpQ(".hp-service-top button", other).setAttribute(
        "aria-expanded",
        "false",
      );
    });
    card.classList.toggle("is-open", expanded);
    trigger.setAttribute("aria-expanded", String(expanded));
    if (!expanded) trigger.blur();
  });
  card.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      card.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      trigger.blur();
    }
  });
});
// 101 layout slots: one supplied photo pair, 100 clearly labelled placeholders.
const names = [
  [
    "Подтяжка лица",
    "Блефаропластика",
    "Эндоскопическая подтяжка",
    "Визаж-лифт",
    "Ринопластика",
    "Отопластика",
  ],
  [
    "Увеличение груди",
    "Подтяжка груди",
    "Уменьшение груди",
    "Удаление и замена имплантов",
    "Гинекомастия",
  ],
  ["BodyTite", "Липосакция", "Vaser и вибрационная липосакция"],
  [
    "Абдоминопластика",
    "Миниабдоминопластика",
    "Эндоскопическая абдоминопластика",
    "Удаление грыжи",
    "Бодилифт",
  ],
];
const results = [
  { category: 0, name: "Подтяжка лица", real: true, before: "assets/ba-before.webp", after: "assets/ba-after.webp" },
  { category: 3, name: "Пластика живота", real: true, before: "assets/v8-ba-abdomen-before.webp", after: "assets/v8-ba-abdomen-after.webp" },
  { category: 0, name: "Пластика шеи и подбородка", real: true, before: "assets/v8-ba-neck-before.webp", after: "assets/v8-ba-neck-after.webp" },
  { category: 1, name: "Увеличение груди", real: true, before: "assets/v8-ba-breast-before.webp", after: "assets/v8-ba-breast-after.webp" },
  { category: 2, name: "Липосакция спины и боков", real: true, before: "assets/v8-ba-back-before.webp", after: "assets/v8-ba-back-after.webp" },
  ...Array.from({ length: 96 }, (_, i) => ({
    category: i % 4,
    name: names[i % 4][Math.floor(i / 4) % names[i % 4].length],
    real: false,
  })),
];
let resultCategory = -1,
  resultOffset = 0;
function renderResults() {
  const list = results.filter(
    (r) => resultCategory === -1 || r.category === resultCategory,
  );
  const count = innerWidth < 1200 ? 1 : 2;
  resultOffset = Math.max(
    0,
    Math.min(resultOffset, Math.max(0, list.length - count)),
  );
  hpQ(".hp-result-track").innerHTML = list
    .slice(resultOffset, resultOffset + count)
    .map(
      (r) =>
        `<article class="hp-result-card">${r.real ? `<button class="hp-result-pair" data-gallery data-title="${r.name}" data-before="${r.before}" data-after="${r.after}" aria-label="Увеличить фото до и после: ${r.name}"><span><img loading="lazy" src="${r.before}" alt="${r.name}: до операции"><small>До</small></span><span><img loading="lazy" src="${r.after}" alt="${r.name}: после операции"><small>После</small></span></button>` : '<div class="hp-result-pair"><span><small>До</small></span><span><small>После</small></span><em>Фото скоро появятся</em></div>'}<h3>${r.name}</h3><button class="hp-btn hp-outline" data-consult>Хочу также!<span aria-hidden="true">↗</span></button></article>`,
    )
    .join("");
  hpQ("[data-counter=results]").textContent =
    `${resultOffset + 1}–${Math.min(resultOffset + count, list.length)} / ${list.length}`;
  hpQ("[data-prev=results]").disabled = resultOffset === 0;
  hpQ("[data-next=results]").disabled = resultOffset + count >= list.length;
}
hpAll("[data-category]").forEach((b) =>
  b.addEventListener("click", () => {
    resultCategory = Number(b.dataset.category);
    resultOffset = 0;
    hpAll("[data-category]").forEach((x) => {
      const active = x === b;
      x.classList.toggle("is-active", active);
      x.setAttribute("aria-pressed", String(active));
    });
    renderResults();
  }),
);
hpQ("[data-prev=results]").addEventListener("click", () => {
  resultOffset -= innerWidth < 1200 ? 1 : 2;
  renderResults();
});
hpQ("[data-next=results]").addEventListener("click", () => {
  resultOffset += innerWidth < 1200 ? 1 : 2;
  renderResults();
});
addEventListener("resize", renderResults);
renderResults();
// Independent process scroll, with the nearest visible step driving the left title.
const stepPanel = hpQ(".hp-stage-scroll"),
  steps = hpAll(".hp-step");
const stageIcons = [
 '<path d="M4 4h16v12H9l-5 4z"/><path d="M8 8h8M8 12h5"/>',
 '<path d="M8 4H5v17h14V4h-3M9 2h6v4H9zM8 11h8M8 15h4"/>',
 '<path d="m3 21 8-8M9 11 18 2l4 4-9 9zM14 6l4 4"/>',
 '<path d="M3 7v14M3 17h18v4M3 12h18v5M6 8h5v4H6zM15 4h6M18 1v6"/>',
 '<path d="M12 21s-9-5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12zM8 12h2l2-4 2 7 2-3h2"/>',
 '<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>'
];
let stepTick = false;
function selectStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("is-active", i === index);
    hpQ("button", step).setAttribute("aria-pressed", String(i === index));
  });
  hpQ(".v7-stage-icon").innerHTML = stageIcons[index];
  hpQ(".hp-stage-number").textContent = String(index + 1).padStart(2, "0");
  hpQ(".hp-stage-visual h3").textContent = hpQ("h3", steps[index]).textContent;
  const ring = hpQ(".v8-ring-progress");
  if (ring) ring.style.strokeDashoffset = String(100 - ((index + 1) / steps.length) * 100);
}
function syncStep() {
  const top =
    stepPanel.getBoundingClientRect().top + stepPanel.clientHeight * 0.22;
  let active = 0;
  steps.forEach((step, i) => {
    if (step.getBoundingClientRect().top <= top) active = i;
  });

  selectStep(active);
  stepTick = false;
}
stepPanel.addEventListener("scroll", syncStep, { passive: true });
steps.forEach((step, i) =>
  hpQ("button", step).addEventListener("click", () => {
    const offset =
      step.getBoundingClientRect().top -
      stepPanel.getBoundingClientRect().top +
      stepPanel.scrollTop -
      24;
    selectStep(i);
    stepPanel.scrollTo({ top: offset, behavior: "instant" });
  }),
);
const reviews = hpAll(".hp-review");
let reviewIndex = 0;
function selectReview(index) {
  reviewIndex = (index + reviews.length) % reviews.length;
  reviews.forEach((r, i) => (r.hidden = i !== reviewIndex));
  markLongReviews();
  hpQ("[data-counter=reviews]").textContent =
    `${reviewIndex + 1} / ${reviews.length}`;
}
hpQ("[data-prev=reviews]").addEventListener("click", () =>
  selectReview(reviewIndex - 1),
);
hpQ("[data-next=reviews]").addEventListener("click", () =>
  selectReview(reviewIndex + 1),
);
selectReview(0);

// The portrait meets the first full-width button on mobile and the stage edge on desktop.
function alignHeroPortrait() {
  const layout = hpQ(".hero-layout"),
    buttons = hpQ(".hero-buttons");
  if (innerWidth < 720) {
    const distance =
      layout.getBoundingClientRect().bottom -
      buttons.getBoundingClientRect().top -
      4;
    layout.style.setProperty("--portrait-bottom", `${Math.max(0, distance)}px`);
  } else layout.style.removeProperty("--portrait-bottom");
}
alignHeroPortrait();
addEventListener("resize", alignHeroPortrait);
document.fonts.ready.then(alignHeroPortrait);
addEventListener("load", alignHeroPortrait);
new ResizeObserver(alignHeroPortrait).observe(hpQ(".hero-layout"));
const certificateDialog = hpQ("#certificate-dialog");
let certificateIndex = 0;
function selectCertificate(index) {
  certificateIndex = (index + 3) % 3;
  hpQ("#certificate-image").src =
    `assets/certificate-sample-${certificateIndex + 1}.svg`;
  hpQ("#certificate-image").alt = [
    "Образец сертификата специалиста",
    "Образец диплома",
    "Образец документа о повышении квалификации",
  ][certificateIndex];
  hpQ("#certificate-caption") && (hpQ("#certificate-caption").textContent = ["Сертификат специалиста","Диплом о высшем образовании","Удостоверение о повышении квалификации"][certificateIndex]);
  hpQ("#certificate-count").textContent = `${certificateIndex + 1} / 3`;
}
document.addEventListener("click", (event) => {
  const cert = event.target.closest("[data-certificates]"),
    checklist = event.target.closest("[data-checklist]");
  if (cert) {
    selectCertificate(0);
    showDialog("certificate-dialog", cert);
  }
  if (checklist) showDialog("checklist-dialog", checklist);
});
hpQ("[data-cert-prev]").addEventListener("click", () =>
  selectCertificate(certificateIndex - 1),
);
hpQ("[data-cert-next]").addEventListener("click", () =>
  selectCertificate(certificateIndex + 1),
);
certificateDialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") selectCertificate(certificateIndex - 1);
  if (event.key === "ArrowRight") selectCertificate(certificateIndex + 1);
});
hpAll(".hp-contact-choice input").forEach((input) =>
  input.addEventListener("change", () => {
    const form = input.closest("form");
    hpQ(".hp-channel-field>span", form).textContent =
      input.value === "Звонок" ? "Телефон" : `Номер телефона в ${input.value}`;
    hpQ(".hp-channel-field input", form).placeholder = "+7 (___) ___-__-__";
  }),
);
// The education/awards row is directly swipeable on narrow screens and keyboard scrollable.
const pathTrack = hpQ(".hp-path-track");
pathTrack?.setAttribute("tabindex", "0");
pathTrack?.setAttribute("aria-label", "Образование и достижения, хронология");
document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-awards]");
  if (el) showDialog("awards-dialog", el);
});

// Spacer so the last steps reach the reading line one by one.
function padStages() {
  const last = steps[steps.length - 1];
  if (!last) return;
  const scrollable = getComputedStyle(stepPanel).overflowY !== "visible";
  stepPanel.style.paddingBottom = scrollable
    ? `${Math.max(0, stepPanel.clientHeight - last.offsetHeight - 24)}px`
    : "";
}
padStages();
addEventListener("resize", padStages);
// Swipe for before/after on touch screens.
(() => {
  const track = hpQ(".hp-result-track");
  if (!track) return;
  let x0 = null;
  track.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) < 40) return;
    const btn = hpQ(dx < 0 ? "[data-next=results]" : "[data-prev=results]");
    if (!btn.disabled) btn.click();
  });
})();

// Reviews: equal short cards, full text in a popup.
function markLongReviews() {
  hpAll(".v8-review").forEach((fig) => {
    const q = hpQ("blockquote", fig), btn = hpQ("[data-review-full]", fig);
    if (!q || !btn) return;
    const wasHidden = fig.hidden;
    if (wasHidden) { fig.hidden = false; fig.style.visibility = "hidden"; fig.style.position = "absolute"; }
    btn.hidden = !(q.scrollHeight > q.clientHeight + 2);
    if (wasHidden) { fig.hidden = true; fig.style.visibility = ""; fig.style.position = ""; }
  });
}
markLongReviews();
addEventListener("resize", markLongReviews);
document.fonts?.ready.then(markLongReviews);
document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-review-full]");
  if (!btn) return;
  const fig = btn.closest(".v8-review"), d = hpQ("#review-dialog");
  hpQ("#review-dialog-tag", d).innerHTML = hpQ(".v8-review-tag", fig).innerHTML;
  hpQ("#review-dialog-text", d).innerHTML = hpQ("blockquote", fig).innerHTML;
  hpQ("#review-dialog-name", d).textContent = hpQ("figcaption strong", fig).textContent;
  hpQ("#review-dialog-src", d).textContent = hpQ("figcaption span", fig).textContent;
  showDialog("review-dialog", btn);
});

// СМИ: слайдер — свайп на тач-экранах, перетаскивание мышью на десктопе.
(() => {
  const track = hpQ(".hp-media-grid");
  if (!track) return;
  track.setAttribute("tabindex", "0");
  track.setAttribute("aria-label", "Публикации в СМИ — листайте вбок");
  let down = false, x0 = 0, s0 = 0, moved = false;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || track.scrollWidth <= track.clientWidth + 2) return;
    down = true; moved = false; x0 = e.clientX; s0 = track.scrollLeft;
    track.classList.add("is-dragging");
  });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = s0 - dx;
  });
  addEventListener("pointerup", () => { down = false; track.classList.remove("is-dragging"); });
  track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
})();

// Портрет на десктопе всегда стоит на нижней границе красного фона.
function pinDoctor() {
  const fig = hpQ(".doctor-figure"), img = hpQ("img.doctor"), stage = hpQ(".stage");
  if (!fig || !img || !stage) return;
  fig.style.removeProperty("bottom");
  if (innerWidth < 1200) return;
  const gap = stage.getBoundingClientRect().bottom - img.getBoundingClientRect().bottom;
  if (Math.abs(gap) < 0.5) return;
  const cur = parseFloat(getComputedStyle(fig).bottom) || 0;
  fig.style.setProperty("bottom", `${cur - gap}px`, "important");
}
pinDoctor();
addEventListener("resize", pinDoctor);
addEventListener("load", pinDoctor);
document.fonts?.ready.then(pinDoctor);
hpQ("img.doctor")?.addEventListener("load", pinDoctor);
new ResizeObserver(pinDoctor).observe(hpQ(".stage"));
