/* ============================================================
   Решение 100 — интерактив сайта
   ============================================================ */
(function () {
  'use strict';

  /* ---- Мобильное меню ---- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('.nav__link').forEach((link) =>
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  /* ---- Тень шапки + кнопка «наверх» при скролле ---- */
  const header = document.getElementById('header');
  const toTop = document.getElementById('toTop');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (toTop) toTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  /* ---- Появление блоков при прокрутке ----
     Отказоустойчиво: что в зоне видимости — показываем сразу, остальное —
     по мере прокрутки через IntersectionObserver. Плюс страховочный таймер,
     гарантирующий, что контент будет виден, даже если Observer не сработает. */
  const reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  let revealIndex = 0;
  const showEl = (el) => {
    if (el.classList.contains('in')) return;
    el.style.transitionDelay = Math.min(revealIndex++ * 50, 240) + 'ms';
    el.classList.add('in');
  };
  const showIfInView = () => {
    const h = window.innerHeight || document.documentElement.clientHeight;
    reveals.forEach((el) => {
      if (el.classList.contains('in')) return;
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.92 && r.bottom > 0) showEl(el);
    });
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            showEl(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  }

  // Мгновенный показ видимого + резервный показ всего (если Observer молчит)
  showIfInView();
  window.addEventListener('load', showIfInView);
  window.addEventListener('scroll', showIfInView, { passive: true });
  setTimeout(() => reveals.forEach(showEl), 2200);

  /* ---- Счётчики статистики ---- */
  const counters = document.querySelectorAll('.stat__num');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('ru-RU');
    };
    requestAnimationFrame(step);
  };
  const startCount = (el) => {
    if (el._started) return;
    el._started = true;
    animateCount(el);
  };
  const startCountersInView = () => {
    const h = window.innerHeight || document.documentElement.clientHeight;
    counters.forEach((el) => {
      if (el._started) return;
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.9 && r.bottom > 0) startCount(el);
    });
  };

  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            startCount(e.target);
            io2.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => io2.observe(el));
  }

  // Запуск для видимых + страховка: безусловно проставить итоговые числа.
  // К 2.5с анимация (1.6с) у реальных пользователей уже завершена, поэтому
  // повторная установка значения визуально ничего не меняет, но гарантирует,
  // что число не «зависнет» на 0 при заблокированном requestAnimationFrame.
  startCountersInView();
  window.addEventListener('scroll', startCountersInView, { passive: true });
  setTimeout(() => {
    counters.forEach((el) => {
      el._started = true;
      el.textContent = (parseInt(el.dataset.count, 10) || 0).toLocaleString('ru-RU');
    });
  }, 2500);

  /* ---- Аккордеон FAQ ---- */
  document.querySelectorAll('.acc__head').forEach((head) => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const body = item.querySelector('.acc__body');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.acc.open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.acc__body').style.maxHeight = null;
          other.querySelector('.acc__head').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !isOpen);
      head.setAttribute('aria-expanded', String(!isOpen));
      body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : null;
    });
  });

  /* ---- Маска телефона ---- */
  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  /* ---- Обработка форм (демо) ----
     ВАЖНО: сейчас форма ничего не отправляет на сервер — только показывает
     уведомление. Чтобы заявки реально приходили, подключите backend:
     Formspree / Web3Forms / собственный обработчик / интеграцию с Bitrix24
     (CRM-форма или вебхук crm.lead.add). См. README.md. */
  const toast = document.getElementById('toast');
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 4200);
  };

  document.querySelectorAll('[data-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : '';
      if (btn) { btn.textContent = 'Отправляем…'; btn.disabled = true; }

      // Имитация отправки. Заменить на реальный fetch() к вашему обработчику.
      setTimeout(() => {
        form.reset();
        if (btn) { btn.textContent = original; btn.disabled = false; }
        showToast('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
      }, 700);
    });
  });

  /* ---- Квиз «Спишут ли долги» ---- */
  const quiz = document.querySelector('[data-quiz]');
  if (quiz) {
    const stepsEls = quiz.querySelectorAll('.quiz__step');
    const bar = quiz.querySelector('[data-quiz-bar]');
    const backBtn = quiz.querySelector('[data-quiz-back]');
    const order = ['1', '2', '3', 'result'];
    const answers = {};
    let idx = 0;
    const renderVerdict = () => {
      const debt = answers['1']; // 0: до 250к, 1: 250–500к, 2: более 500к
      const v = quiz.querySelector('[data-verdict]');
      const vs = quiz.querySelector('[data-verdict-sub]');
      if (!v || !vs) return;
      if (debt === 1 || debt === 2) {
        v.textContent = 'Похоже, банкротство вам подходит';
        vs.textContent = 'По сумме долга процедура реальна. Ниже — обязательные расходы по закону; стоимость нашего сопровождения и рассрочку рассчитаем на бесплатной консультации.';
      } else if (debt === 0) {
        v.textContent = 'Нужна индивидуальная оценка';
        vs.textContent = 'При долге до 250 000 ₽ иногда выгоднее другие пути. Бесплатно разберём вашу ситуацию и подскажем оптимальное решение.';
      }
    };
    const render = () => {
      stepsEls.forEach((s) => s.classList.toggle('is-active', s.dataset.step === order[idx]));
      if (bar) bar.style.width = ((idx + 1) / order.length) * 100 + '%';
      if (backBtn) backBtn.hidden = idx === 0;
      if (order[idx] === 'result') renderVerdict();
    };
    quiz.querySelectorAll('[data-next]').forEach((btn) =>
      btn.addEventListener('click', () => {
        const step = btn.closest('.quiz__step');
        if (step) answers[step.dataset.step] = Array.prototype.indexOf.call(btn.parentElement.children, btn);
        if (idx < order.length - 1) { idx++; render(); }
      })
    );
    if (backBtn) backBtn.addEventListener('click', () => {
      if (idx > 0) { idx--; render(); }
    });
    render();
  }

  /* ---- Модалка обратного звонка ---- */
  const cbModal = document.getElementById('callbackModal');
  if (cbModal) {
    const openM = () => { cbModal.hidden = false; document.body.style.overflow = 'hidden'; };
    const closeM = () => { cbModal.hidden = true; document.body.style.overflow = ''; };
    document.querySelectorAll('[data-callback]').forEach((b) =>
      b.addEventListener('click', (e) => { e.preventDefault(); openM(); }));
    cbModal.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeM));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cbModal.hidden) closeM(); });
    const mf = cbModal.querySelector('[data-modal-form]');
    if (mf) mf.addEventListener('submit', () => setTimeout(closeM, 900));
  }

  /* ---- Прогресс прокрутки ---- */
  const sb = document.getElementById('scrollbar');
  if (sb) {
    const updSb = () => {
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      sb.style.width = (max > 0 ? (d.scrollTop / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', updSb, { passive: true });
    window.addEventListener('resize', updSb);
    updSb();
  }

  /* ---- Год в подвале ---- */
})();
