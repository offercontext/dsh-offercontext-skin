window.__ModuleLoader__.load({
  id: '@offercontext/dsh-skin-reading',
  factory: () => ({
    inject: ['layout'],
    apply(ctx) {
      const body = document.body;
      const previous = body.getAttribute('data-oc-reading');
      const style = document.createElement('style');
      style.dataset.ocReadingStyle = '';
      style.textContent = /* THEME_CSS */ "";
      document.head.append(style);
      body.setAttribute('data-oc-reading', '');
      // Only observe sidebar mounts. Never rewrite messages, icons, inputs or events.
      let art;
      let frame;
      let sidebar;
      const resize = new ResizeObserver(entries => {
        const width = entries[0]?.contentRect.width ?? 0;
        if (sidebar) sidebar.toggleAttribute('data-oc-wide', width > 140);
      });
      const mount = () => {
        frame = null;
        const root = document.querySelector('[data-slot="sidebar"] [class*="_logoRow"]');
        if (!root || (art?.isConnected && root.nextElementSibling === art)) return;
        art?.remove();
        if (sidebar) sidebar.removeAttribute('data-oc-wide');
        sidebar = root.parentElement;
        resize.disconnect();
        resize.observe(sidebar);
        art = document.createElement('div');
        art.dataset.ocReadingMascot = '';
        art.setAttribute('aria-hidden', 'true');
        root.after(art);
      };
      const observer = new MutationObserver(records => {
        if (art?.isConnected) return;
        if (!frame && records.some(r => r.addedNodes.length)) frame = requestAnimationFrame(mount);
      });
      mount();
      observer.observe(body, {childList:true, subtree:true});
      ctx.effect(() => () => {
        observer.disconnect(); resize.disconnect();
        if (frame) cancelAnimationFrame(frame);
        art?.remove(); style.remove();
        sidebar?.removeAttribute('data-oc-wide');
        if (previous === null) body.removeAttribute('data-oc-reading');
        else body.setAttribute('data-oc-reading', previous);
      }, 'reading: restore owned presentation');
    }
  })
});
