(function (root) {
  'use strict';
  function normalize(value) { return String(value || '').toLocaleLowerCase('ru').replace(/ё/g, 'е').trim(); }
  function filterProjects(projects, category, query) {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return projects.filter(p => (category === 'all' || p.categories.includes(category)) && words.every(word => normalize([p.title, p.type, p.summary, p.task, p.role, p.result, ...p.tags, ...p.work, ...(p.collections || []).flatMap(c => [c.label, c.description, c.details?.task, c.details?.role, c.details?.result, ...(c.details?.work || [])])].join(' ')).includes(word)));
  }
  function galleryIndex(index, length) { return length ? ((index % length) + length) % length : 0; }
  function projectFromHash(hash, projects) { const match = /^#case\/([a-z0-9-]+)$/.exec(hash); return match ? projects.find(p => p.id === match[1]) || projects.find(p => p.collections?.some(c => c.legacyCaseId === match[1])) || null : null; }
  const api = {normalize, filterProjects, galleryIndex, projectFromHash};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PortfolioCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
