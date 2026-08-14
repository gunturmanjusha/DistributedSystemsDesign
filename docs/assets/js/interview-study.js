(() => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"][data-section]'));
  const panels = Array.from(document.querySelectorAll('.interview-panel[role="tabpanel"]'));
  const tabList = document.querySelector('[role="tablist"]');

  if (!tabs.length || !panels.length || !tabList) return;

  const panelForTarget = (targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return null;
    return target.classList.contains('interview-panel') ? target : target.closest('.interview-panel');
  };

  const targetFromHash = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return id ? document.getElementById(id) : null;
  };

  const selectPanel = (panel, { focusTab = false, scrollTarget = null, shouldScroll = true } = {}) => {
    if (!panel) panel = document.getElementById('requirements');

    panels.forEach((candidate) => {
      const selected = candidate === panel;
      candidate.hidden = !selected;
      candidate.classList.toggle('is-active', selected);
    });

    tabs.forEach((tab) => {
      const selected = tab.dataset.section === panel.id;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focusTab) tab.focus();
    });

    if (shouldScroll) {
      const destination = scrollTarget || panel;
      requestAnimationFrame(() => destination.scrollIntoView({ block: 'start', behavior: 'auto' }));
    }
  };

  const openHash = ({ focusTab = false } = {}) => {
    const target = targetFromHash();
    const panel = target ? panelForTarget(target.id) : document.getElementById('requirements');
    selectPanel(panel, { focusTab, scrollTarget: target || panel });
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = document.getElementById(targetId);
    const panel = target ? panelForTarget(targetId) : null;
    if (!target || !panel) return;

    event.preventDefault();
    history.pushState(null, '', `#${targetId}`);
    selectPanel(panel, { focusTab: link.matches('[role="tab"]'), scrollTarget: target });
  });

  tabList.addEventListener('keydown', (event) => {
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex < 0) return;

    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    history.pushState(null, '', nextTab.getAttribute('href'));
    selectPanel(document.getElementById(nextTab.dataset.section), { focusTab: true });
  });

  window.addEventListener('hashchange', () => openHash());
  if (window.location.hash) openHash();
  else selectPanel(document.getElementById('requirements'), { shouldScroll: false });
})();
