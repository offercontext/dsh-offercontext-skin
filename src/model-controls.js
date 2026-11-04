function mountModelControls() {
  const menuSelector = '._9r0rkG_menu';
  let activeMenu, panel, modelRequested = false, enteredEffort = false, modelTitle, effortTitle;
  function sync() {
    const menu = document.querySelector(menuSelector);
    if (menu !== activeMenu) {
      panel?.remove();
      panel = null;
      modelRequested = false;
      enteredEffort = false;
      activeMenu = menu;
    }
    if (!menu) return;
    const cells = menu.querySelectorAll(':scope > ._9r0rkG_cell');
    if (cells.length) {
      panel?.remove();
      panel = null;
      menu.removeAttribute('data-oc-efforts');
      if (modelRequested) {
        modelRequested = false;
        cells[0].click();
      } else if (!enteredEffort && cells[1] && !cells[1].disabled) {
        enteredEffort = true;
        modelTitle = cells[0].querySelector('._9r0rkG_cellValue')?.textContent.trim();
        effortTitle = cells[1].querySelector('._9r0rkG_cellLabel')?.textContent.trim();
        cells[1].click();
      }
      return;
    }
    const rows = [...menu.querySelectorAll(':scope > button[role="menuitemradio"]')];
    const selected = rows.findIndex(row => row.getAttribute('aria-checked') === 'true');
    if (selected < 0 || !modelTitle || rows.length < 2) {
      panel?.remove();
      panel = null;
      menu.removeAttribute('data-oc-efforts');
      return;
    }
    const labels = rows.map(row => row.querySelector('._9r0rkG_modelName').textContent.trim());
    const signature = JSON.stringify([modelTitle, effortTitle, labels, selected, rows.map(row => row.disabled)]);
    if (panel?.dataset.state === signature) return;
    panel?.remove();
    panel = document.createElement('div');
    panel.className = 'oc-model-panel';
    panel.dataset.state = signature;
    const model = document.createElement('button');
    model.type = 'button';
    model.className = 'oc-model-choice';
    model.textContent = modelTitle;
    model.onclick = () => {
      modelRequested = true;
      rows[selected].dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
    };
    const title = document.createElement('small');
    title.textContent = document.documentElement.lang.startsWith('en') ? 'Model' : '模型';
    const label = document.createElement('label');
    const output = document.createElement('strong');
    label.append(effortTitle, output);
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = rows.length - 1;
    slider.value = selected;
    slider.disabled = rows.some(row => row.disabled);
    slider.setAttribute('aria-label', effortTitle);
    const updateValue = () => {
      const value = labels[slider.valueAsNumber];
      output.textContent = value;
      slider.setAttribute('aria-valuetext', value);
    };
    updateValue();
    slider.oninput = updateValue;
    slider.onchange = () => menu.querySelectorAll(':scope > button[role="menuitemradio"]')[slider.valueAsNumber]?.click();
    slider.onkeydown = event => {
      if (['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(event.key)) event.stopPropagation();
    };
    panel.onkeydown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        document.querySelector('._9r0rkG_trigger[aria-expanded="true"]')?.click();
      }
    };
    const ticks = document.createElement('div');
    ticks.className = 'oc-model-ticks';
    for (const value of labels) {
      const tick = document.createElement('span');
      tick.textContent = value;
      ticks.append(tick);
    }
    panel.append(title, model, label, slider, ticks);
    menu.append(panel);
    menu.setAttribute('data-oc-efforts', '');
    if (!slider.disabled) slider.focus({preventScroll:true});
  }
  const observer = new MutationObserver(records => {
    if (activeMenu || records.some(record => [...record.addedNodes].some(node =>
      node.nodeType === 1 && (node.matches(menuSelector) || node.querySelector(menuSelector))))) sync();
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-checked','disabled']});
  sync();
  return () => {
    observer.disconnect();
    panel?.remove();
    activeMenu?.removeAttribute('data-oc-efforts');
  };
}
