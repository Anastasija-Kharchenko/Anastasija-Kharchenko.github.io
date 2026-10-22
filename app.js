(function () {
  'use strict';
  const projects = window.PORTFOLIO_PROJECTS;
  const core = window.PortfolioCore;
  const byId = id => document.getElementById(id);
  const grid = byId('project-grid'), search = byId('project-search'), dialog = byId('case-dialog');
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  let category = 'all', activeProject = null, activeCollection = 0, slide = 0, opener = null, previousHash = '#projects';
  const create = (tag, className, content) => { const el = document.createElement(tag); if (className) el.className = className; if (content !== undefined) el.textContent = content; return el; };
  const labels = {all: 'Все кейсы', design: 'Дизайн', structure: 'Структура', coordination: 'Координация', clients: 'Клиенты'};
  const visuals = {
    web: ['ЛЕНДИНГ / TILDA', 'Эл Невталиев', ['Контент', 'Заявки', 'Рассрочка']],
    crm: ['STPULSE / ПОЛЬЗОВАТЕЛИ', 'Клиентский\nпроцесс', ['Обращение', 'Доступ', 'Продление']],
    content: ['МАРКЕТПЛЕЙСЫ / КОНТЕНТ', 'Одежда\nи обувь', ['Инфографика', 'Фото', 'Видео']],
    event: ['ТАВРИДА / КООРДИНАЦИЯ', 'Люди.\nРасписание. Площадка.', ['Спикеры', 'Участники', 'Программа']],
    planning: ['ЛИЧНЫЙ ПРОЕКТ / 2026', 'От концепции\nдо события', ['Концепция', 'Подрядчики', 'Смета']],
    automation: ['ДИПЛОМ / PYTHON', 'Структура\nручного процесса', ['Анализ', 'Схема', 'Прототип']]
  };
  function artwork(p) {
    const v = visuals[p.visual], el = create('div', 'art-cover ' + p.visual);
    el.append(create('span', 'art-label', v[0]));
    const title = create('strong', '', v[1]); title.style.whiteSpace = 'pre-line'; el.append(title);
    const steps = create('div', 'art-steps'); v[2].forEach(t => steps.append(create('span', '', t))); el.append(steps);
    el.append(create('span', 'art-caption', 'ВЕБ-ПРОЕКТ · TILDA')); return el;
  }
  function openButton(p, className, text) {
    const btn = create('button', className, text); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', () => { opener = btn; previousHash = location.hash.startsWith('#case/') ? '#projects' : location.hash || '#projects'; location.hash = 'case/' + p.id; }); return btn;
  }
  function card(p) {
    const article = create('article', 'project-card'); article.dataset.project = p.id;
    const cover = openButton(p, 'project-cover'); cover.setAttribute('aria-label', 'Открыть кейс: ' + p.title);
    if (p.coverImages) {const series = create('div', 'cover-series-grid'); series.style.gridTemplateColumns = 'repeat(' + p.coverImages.length + ', minmax(0, 1fr))'; cover.classList.add('cover-series'); p.coverImages.forEach(src => {const img = create('img'); img.src = 'assets/' + src; img.alt = ''; img.width = 1536; img.height = 2048; img.loading = 'lazy'; series.append(img);}); cover.append(series);}
    else if (p.cover) { const img = create('img'); img.src = 'assets/' + p.cover; img.alt = p.type + ' — фрагмент работы'; img.width = 1400; img.height = 788; img.loading = 'lazy'; cover.append(img); }
    else cover.append(artwork(p));
    const arrow = create('span', 'cover-arrow', '↗'); arrow.setAttribute('aria-hidden', 'true'); cover.append(arrow);
    const body = create('div', 'project-card-body'); body.append(create('p', 'project-type', p.type));
    const h3 = create('h3'); h3.append(openButton(p, '', p.title)); body.append(h3, create('p', 'project-summary', p.summary));
    const tags = create('div', 'project-tags'); p.tags.forEach(t => tags.append(create('span', '', t))); body.append(tags);
    const open = openButton(p, 'case-open', 'Разобрать кейс'); const a = create('span', '', '↗'); a.setAttribute('aria-hidden', 'true'); open.append(a); body.append(open);
    article.append(cover, body); return article;
  }
  function render() {
    const visible = core.filterProjects(projects, category, search.value);
    grid.replaceChildren(...visible.map(card)); byId('empty-state').hidden = visible.length !== 0;
    byId('result-status').textContent = labels[category] + ' · показано ' + visible.length + ' из ' + projects.length;
    filters.forEach(btn => { const on = btn.dataset.filter === category; btn.classList.toggle('active', on); btn.setAttribute('aria-pressed', String(on)); });
  }
  filters.forEach(btn => btn.addEventListener('click', () => {category = btn.dataset.filter; render();}));
  search.addEventListener('input', render);
  byId('reset-filters').addEventListener('click', () => {category = 'all'; search.value = ''; render(); search.focus();});
  document.querySelectorAll('[data-direction]').forEach(btn => btn.addEventListener('click', () => {category = btn.dataset.direction; search.value = ''; render(); location.hash = 'projects'; byId('projects').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});}));
  function galleryData() { return activeProject.collections ? activeProject.collections[activeCollection] : activeProject; }
  function gallerySlides(data) { return data.slides || data.images.map((_src, index) => ({indices: [index], caption: data.captions[index]})); }
  function renderSlide() {
    const data = galleryData(), slides = gallerySlides(data);
    slide = core.galleryIndex(slide, slides.length);
    const current = slides[slide], grouped = current.indices.length > 1;
    const stage = byId('gallery-stage'), display = byId('gallery-display'); stage.classList.toggle('group-stage', grouped);
    if (grouped) {
      const grid = create('div', 'gallery-card-grid');
      current.indices.forEach(index => {
        const link = create('a', 'gallery-card-link'); link.href = 'assets/' + data.images[index]; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.setAttribute('aria-label', 'Рассмотреть карточку: ' + data.captions[index]);
        const img = create('img'); img.src = link.href; img.alt = data.captions[index]; img.width = 825; img.height = 825; link.append(img); grid.append(link);
      });
      display.replaceChildren(grid);
    } else {
      const index = current.indices[0], img = create('img'); img.id = 'gallery-image'; img.src = 'assets/' + data.images[index]; img.alt = data.captions[index]; img.width = data.imageWidth || 1400; img.height = data.imageHeight || 788; display.replaceChildren(img);
    }
    byId('gallery-caption').textContent = current.caption; byId('gallery-counter').textContent = (slide + 1) + ' / ' + slides.length;
    const original = byId('gallery-original'); original.hidden = grouped; original.href = grouped ? '' : 'assets/' + data.images[current.indices[0]];
    document.querySelectorAll('.gallery-thumb').forEach((btn, index) => btn.setAttribute('aria-pressed', String(index === slide)));
  }
  function moveSlide(step) { slide += step; renderSlide(); }
  function gallery(p) {
    const data = galleryData(), slides = gallerySlides(data);
    const portrait = data.aspect === 'portrait', square = data.aspect === 'square';
    const root = create('section', portrait ? 'gallery portrait-gallery' : square ? 'gallery square-gallery' : 'gallery'); root.setAttribute('aria-label', data.label || 'Фрагменты работы');
    if (data.description) root.append(create('p', 'gallery-description', data.description));
    const stage = create('div', portrait ? 'gallery-stage portrait-stage' : square ? 'gallery-stage square-stage' : 'gallery-stage'), display = create('div', 'gallery-display'); stage.id = 'gallery-stage'; display.id = 'gallery-display';
    if (portrait || square || data.aspect === 'screen') stage.style.aspectRatio = data.imageWidth + ' / ' + data.imageHeight;
    stage.append(display);
    if (slides.length > 1) {
      for (const [name, text, step, aria] of [['prev', '‹', -1, 'Предыдущий фрагмент'], ['next', '›', 1, 'Следующий фрагмент']]) {
        const btn = create('button', 'gallery-nav gallery-' + name, text); btn.type = 'button'; btn.setAttribute('aria-label', aria); btn.addEventListener('click', () => moveSlide(step)); stage.append(btn);
      }
    }
    const row = create('div', 'gallery-caption-row'), caption = create('span'), counter = create('span'); caption.id = 'gallery-caption'; counter.id = 'gallery-counter'; row.setAttribute('aria-live', 'polite'); row.append(caption, counter);
    const thumbs = create('div', 'gallery-thumbs'); thumbs.setAttribute('role', 'group'); thumbs.setAttribute('aria-label', 'Выбор фрагмента');
    slides.forEach((item, index) => {
      const btn = create('button', 'gallery-thumb'); btn.type = 'button'; btn.setAttribute('aria-label', item.caption); btn.setAttribute('aria-pressed', 'false');
      const preview = item.indices.length > 1 ? create('span', 'gallery-thumb-grid') : btn;
      item.indices.forEach(imageIndex => {const thumb = create('img'); thumb.src = 'assets/' + data.images[imageIndex]; thumb.alt = ''; thumb.width = data.imageWidth || 1400; thumb.height = data.imageHeight || 788; thumb.loading = 'lazy'; preview.append(thumb);});
      if (preview !== btn) btn.append(preview);
      btn.addEventListener('click', () => {slide = index; renderSlide();}); thumbs.append(btn);
    });
    const original = create('a', 'gallery-original', 'Открыть изображение в полном размере ↗'); original.id = 'gallery-original'; original.target = '_blank'; original.rel = 'noopener noreferrer';
    const resources = create('div', 'gallery-resource-links'); resources.append(original);
    if (data.document) {const pdf = create('a', 'gallery-document', data.document.label + ' ↗'); pdf.href = 'assets/' + data.document.src; pdf.target = '_blank'; pdf.rel = 'noopener noreferrer'; resources.append(pdf);}
    root.append(stage, row, thumbs, resources); return root;
  }
  function renderVisuals() {
    const region = byId('case-visuals'); region.replaceChildren(gallery(activeProject));
    document.querySelectorAll('.collection-tab').forEach((btn, index) => {const on = index === activeCollection; btn.setAttribute('aria-pressed', String(on)); btn.classList.toggle('active', on);});
    renderSlide();
    if (galleryData().details) renderCaseContext(galleryData().details);
  }
  function publicationProof(p) {
    const section = create('details', 'publication-proof');
    section.append(create('summary', '', p.publicationTitle || 'Примеры размещения'));
    section.append(create('p', 'publication-description', p.publicationDescription || 'Скриншоты размещённых материалов. Изображения можно открыть в полном размере.'));
    const grid = create('div', p.publicationScreenshots.length === 1 ? 'publication-grid single-publication' : p.publicationScreenshots.length === 2 ? 'publication-grid two-publications' : 'publication-grid');
    p.publicationScreenshots.forEach(item => {
      const figure = create('figure'), link = create('a'); link.href = 'assets/' + item.src; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.setAttribute('aria-label', 'Открыть скриншот: ' + item.caption);
      const img = create('img'); img.src = link.href; img.alt = item.caption; img.width = item.width; img.height = item.height; img.loading = 'lazy'; link.append(img); figure.append(link, create('figcaption', '', item.caption)); grid.append(figure);
    });
    section.append(grid); return section;
  }
  function pauseVideos() { document.querySelectorAll('.case-video').forEach(video => video.pause()); }
  function videoShowcase(p) {
    const section = create('section', 'video-showcase'); section.setAttribute('aria-labelledby', 'case-video-title');
    const heading = create('h3', '', 'Видео со съёмки'); heading.id = 'case-video-title';
    section.append(heading, create('p', 'video-credit', 'Съёмка и монтаж — Анастасия Багаутдинова.'));
    const items = create('div', 'video-grid');
    p.videos.forEach(item => {
      const figure = create('figure', 'video-item');
      const video = create('video', 'case-video'); video.controls = true; video.playsInline = true; video.preload = 'none'; video.src = 'assets/' + item.src; video.poster = 'assets/' + item.poster; video.width = item.width; video.height = item.height;
      video.setAttribute('aria-label', item.title + '. Съёмка и монтаж Анастасии Багаутдиновой.');
      video.addEventListener('play', () => document.querySelectorAll('.case-video').forEach(other => {if (other !== video) other.pause();}));
      const caption = create('figcaption'); caption.append(create('strong', '', item.title), create('span', '', item.durationLabel + ' · вертикальное видео'));
      const original = create('a', 'video-original', 'Открыть видео отдельно ↗'); original.href = 'assets/' + item.src; original.target = '_blank'; original.rel = 'noopener noreferrer';
      figure.append(video, caption, original); items.append(figure);
    });
    section.append(items); return section;
  }
  function renderCaseContext(p) {
    const content = byId('case-context'); content.replaceChildren();
    if (p.publicationScreenshots && p.publicationScreenshots.length) content.append(publicationProof(p));
    if (p.videos && p.videos.length) content.append(videoShowcase(p));
    const details = create('div', 'case-details'), context = create('div'); context.append(create('h3', '', 'Задача'), create('p', '', p.task));
    const role = create('div', 'case-role'); role.append(create('h3', '', 'Моя роль'), create('p', '', p.role)); context.append(role);
    const work = create('div'); work.append(create('h3', '', 'Что сделала')); const list = create('ul', 'case-work'); p.work.forEach(t => list.append(create('li', '', t))); work.append(list); details.append(context, work);
    const result = create('div', 'case-result'); result.append(create('h3', '', 'Результат работы'), create('p', '', p.result)); details.append(result);
    if (p.note) details.append(create('p', 'case-note', p.note));
    if (p.links) { const links = create('div', 'case-link-row'); p.links.forEach(l => { const link = create('a', 'button button-primary', l.label + ' ↗'); link.href = l.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; links.append(link); }); details.append(links); }
    content.append(details);
  }
  function showProject(p) {
    pauseVideos();
    activeProject = p; activeCollection = Math.max(0, (p.collections || []).findIndex(c => c.legacyCaseId === location.hash.slice(6))); slide = 0;
    const content = byId('case-content'); content.replaceChildren(); byId('case-number').textContent = 'КЕЙС ' + String(projects.indexOf(p) + 1).padStart(2, '0') + ' / ' + p.type;
    const intro = create('div', 'case-intro'); const title = create('h2', '', p.title); title.id = 'case-title'; intro.append(create('p', 'eyebrow', p.tags.join(' · ')), title, create('p', '', p.summary)); content.append(intro);
    if (p.collections) {
      const choices = create('div', p.collections.length > 5 ? 'collection-tabs collection-tabs-many' : 'collection-tabs'); choices.setAttribute('role', 'group'); choices.setAttribute('aria-label', 'Раздел кейса');
      p.collections.forEach((collection, index) => {const btn = create('button', 'collection-tab', collection.tabLabel || (collection.label + ' · ' + collection.images.length + ' макетов')); btn.type = 'button'; btn.setAttribute('aria-pressed', String(index === activeCollection)); btn.addEventListener('click', () => {activeCollection = index; slide = 0; renderVisuals();}); choices.append(btn);});
      content.append(choices);
    }
    if (p.images.length) {const region = create('div'); region.id = 'case-visuals'; content.append(region);}
    const context = create('div'); context.id = 'case-context'; content.append(context);
    renderCaseContext(p);
    if (p.images.length) renderVisuals();
    if (!dialog.open) dialog.showModal(); document.body.classList.add('dialog-open'); dialog.scrollTop = 0;
  }
  function closeProject() {if (dialog.open) dialog.close();}
  function followHash() { const project = core.projectFromHash(location.hash, projects); if (project) showProject(project); else if (dialog.open) closeProject(); }
  byId('close-dialog').addEventListener('click', closeProject);
  dialog.addEventListener('click', event => {if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject();});
  dialog.addEventListener('close', () => {pauseVideos(); document.body.classList.remove('dialog-open'); if (location.hash.startsWith('#case/')) history.replaceState(null, '', previousHash); if (opener && opener.isConnected) opener.focus(); activeProject = null;});
  document.addEventListener('keydown', event => {if (!dialog.open || !activeProject || !activeProject.images.length || /INPUT|TEXTAREA|VIDEO|AUDIO/.test(event.target.tagName)) return; if (event.key === 'ArrowRight') {event.preventDefault(); moveSlide(1);} if (event.key === 'ArrowLeft') {event.preventDefault(); moveSlide(-1);}});
  window.addEventListener('hashchange', followHash);
  const menu = byId('menu-toggle'), navigation = byId('navigation');
  function closeMenu() {navigation.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false');}
  menu.addEventListener('click', () => {const on = navigation.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(on));});
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {if (e.key === 'Escape') closeMenu();});
  byId('copy-email').addEventListener('click', async () => {try {await navigator.clipboard.writeText('har.nastya@mail.ru'); byId('copy-status').textContent = 'Почта скопирована: har.nastya@mail.ru';} catch {byId('copy-status').textContent = 'Почта для копирования: har.nastya@mail.ru';}});
  render(); followHash();
})();
