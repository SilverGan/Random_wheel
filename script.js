(function () {
  const state = {
    appState: null,
    currentSpinCancel: null,
    currentAnimation: null,
    currentResult: null,
    currentWheel: null,
    isSpinning: false,
    lastRotation: 0
  };

  const elements = {
    wheelCanvas: document.getElementById('wheelCanvas'),
    wheelSelect: document.getElementById('wheelSelect'),
    wheelEditor: document.getElementById('wheelEditor'),
    startButton: document.getElementById('startButton'),
    eliminateButton: document.getElementById('eliminateButton'),
    restoreButton: document.getElementById('restoreButton'),
    historyButton: document.getElementById('historyButton'),
    newWheelButton: document.getElementById('newWheelButton'),
    deleteWheelButton: document.getElementById('deleteWheelButton'),
    renameWheelButton: document.getElementById('renameWheelButton'),
    resultModal: document.getElementById('resultModal'),
    resultText: document.getElementById('resultText'),
    keepButton: document.getElementById('keepButton'),
    keepModalButton: document.getElementById('keepModalButton'),
    eliminateModalButton: document.getElementById('eliminateModalButton'),
    historyModal: document.getElementById('historyModal'),
    historyList: document.getElementById('historyList'),
    clearHistoryButton: document.getElementById('clearHistoryButton'),
    closeHistoryButton: document.getElementById('closeHistoryButton'),
    statusMessage: document.getElementById('statusMessage')
  };

  function init() {
    state.appState = RandomWheelStorage.loadState();
    renderWheelSelector();
    syncEditorFromActiveWheel();
    renderWheel();
    updateActionButtonsState();
    bindEvents();
    window.addEventListener('resize', renderWheel);
  }

  function bindEvents() {
    elements.wheelSelect.addEventListener('change', handleWheelChange);
    elements.wheelEditor.addEventListener('input', handleEditorInput);
    elements.startButton.addEventListener('click', handleStart);
    elements.eliminateButton.addEventListener('click', handleEliminateCurrentResult);
    elements.restoreButton.addEventListener('click', restoreAll);
    elements.historyButton.addEventListener('click', openHistoryModal);
    elements.newWheelButton.addEventListener('click', createNewWheel);
    elements.deleteWheelButton.addEventListener('click', deleteCurrentWheel);
    elements.renameWheelButton.addEventListener('click', renameCurrentWheel);
    elements.keepButton.addEventListener('click', closeResultModal);
    elements.keepModalButton.addEventListener('click', closeResultModal);
    elements.eliminateModalButton.addEventListener('click', eliminateCurrentResultFromModal);
    elements.clearHistoryButton.addEventListener('click', clearHistory);
    elements.closeHistoryButton.addEventListener('click', closeHistoryModal);
    elements.resultModal.addEventListener('click', handleModalBackdropClick);
    elements.historyModal.addEventListener('click', handleModalBackdropClick);

    document.addEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    if (event.code === 'Space' && !event.repeat) {
      event.preventDefault();
      handleStart();
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleStart();
    }

    if (event.key === 'Delete' && state.currentResult) {
      event.preventDefault();
      eliminateCurrentResultFromModal();
    }

    if (event.key === 'Escape') {
      if (elements.historyModal.classList.contains('open')) {
        closeHistoryModal();
      } else if (elements.resultModal.classList.contains('open')) {
        closeResultModal();
      } else {
        cancelSpin();
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      undoLastElimination();
    }
  }

  function handleWheelChange() {
    state.appState.currentWheelId = elements.wheelSelect.value;
    persistState();
    syncEditorFromActiveWheel();
    renderWheel();
  }

  function handleEditorInput() {
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }

    // 每行一个选项，自动清理空行与首尾空格。
    wheel.items = elements.wheelEditor.value
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!wheel.originalItems || !wheel.originalItems.length) {
      wheel.originalItems = wheel.items.slice();
    }
    persistState();
    renderWheel();
  }

  function getActiveWheel() {
    return state.appState.wheels.find((wheel) => wheel.id === state.appState.currentWheelId) || state.appState.wheels[0];
  }

  function renderWheelSelector() {
    elements.wheelSelect.innerHTML = '';
    state.appState.wheels.forEach((wheel) => {
      const option = document.createElement('option');
      option.value = wheel.id;
      option.textContent = wheel.name;
      elements.wheelSelect.appendChild(option);
    });
    elements.wheelSelect.value = state.appState.currentWheelId;
  }

  function syncEditorFromActiveWheel() {
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }

    state.currentWheel = wheel;
    elements.wheelEditor.value = wheel.items.join('\n');
  }

  function renderWheel() {
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }

    RandomWheelCanvas.drawWheel(elements.wheelCanvas, wheel, state.lastRotation);
  }

  function handleStart() {
    if (state.isSpinning) {
      return;
    }

    const wheel = getActiveWheel();
    if (!wheel || !wheel.items.length) {
      showStatus('请先添加选项');
      return;
    }

    state.isSpinning = true;
    const startRotation = state.lastRotation;
    const spins = 8 + Math.random() * 4;
    const fullCircle = Math.PI * 2;
    const targetRotation = startRotation + spins * fullCircle + Math.random() * fullCircle;
    const segmentAngle = fullCircle / wheel.items.length;
    const normalizedRotation = ((targetRotation + Math.PI / 2) % fullCircle + fullCircle) % fullCircle;
    const selectedIndex = Math.floor(normalizedRotation / segmentAngle) % wheel.items.length;
    const result = wheel.items[selectedIndex % wheel.items.length];

    state.currentResult = result;
    state.currentAnimation = RandomWheelAnimation.startSpin({
      startRotation,
      targetRotation,
      duration: 3000,
      onFrame(rotation) {
        state.lastRotation = rotation;
        renderWheel();
      },
      onComplete() {
        state.isSpinning = false;
        state.lastRotation = targetRotation;
        renderWheel();
        openResultModal(result);
        if (wheel.history) {
          wheel.history.unshift(result);
          if (wheel.history.length > 100) {
            wheel.history.length = 100;
          }
        } else {
          wheel.history = [result];
        }
        persistState();
      }
    });
  }

  function cancelSpin() {
    if (state.currentAnimation) {
      state.currentAnimation();
      state.currentAnimation = null;
    }
    state.isSpinning = false;
    renderWheel();
  }

  function openResultModal(result) {
    elements.resultText.textContent = result;
    elements.resultModal.classList.add('open');
    elements.resultModal.setAttribute('aria-hidden', 'false');
    updateActionButtonsState();
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function handleModalBackdropClick(event) {
    if (event.target === event.currentTarget) {
      closeModal(event.currentTarget);
    }
  }

  function closeResultModal() {
    closeModal(elements.resultModal);
    state.currentResult = null;
    updateActionButtonsState();
  }

  function eliminateCurrentResultFromModal() {
    if (!state.currentResult) {
      return;
    }
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }

    wheel.lastEliminated = state.currentResult;
    wheel.items = wheel.items.filter((item) => item !== state.currentResult);
    if (!wheel.items.length) {
      wheel.items = wheel.originalItems.slice();
      showStatus('当前轮盘已空，已恢复原始选项');
    }
    persistState();
    syncEditorFromActiveWheel();
    renderWheel();
    closeResultModal();
    showStatus(`已淘汰：${state.currentResult}`);
    state.currentResult = null;
    updateActionButtonsState();
  }

  function handleEliminateCurrentResult() {
    if (!state.currentResult) {
      showStatus('请先抽取结果');
      return;
    }
    eliminateCurrentResultFromModal();
  }

  function restoreAll() {
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }
    wheel.items = wheel.originalItems.slice();
    wheel.lastEliminated = null;
    persistState();
    syncEditorFromActiveWheel();
    renderWheel();
    showStatus('已恢复全部');
  }

  function undoLastElimination() {
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }
    const lastRemoved = wheel.lastEliminated;
    if (!lastRemoved) {
      return;
    }
    if (!wheel.items.includes(lastRemoved)) {
      wheel.items = [lastRemoved].concat(wheel.items);
      wheel.items = Array.from(new Set(wheel.items));
      wheel.lastEliminated = null;
      persistState();
      syncEditorFromActiveWheel();
      renderWheel();
      showStatus('已撤销最近一次淘汰');
    }
  }

  function createNewWheel() {
    const name = window.prompt('请输入转盘名称', `转盘 ${state.appState.wheels.length + 1}`);
    if (!name) {
      return;
    }
    const wheel = RandomWheelStorage.createWheel(name, []);
    state.appState.wheels.push(wheel);
    state.appState.currentWheelId = wheel.id;
    persistState();
    renderWheelSelector();
    syncEditorFromActiveWheel();
    renderWheel();
    showStatus(`已创建：${name}`);
  }

  function deleteCurrentWheel() {
    if (state.appState.wheels.length <= 1) {
      showStatus('至少保留一个转盘');
      return;
    }
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }
    const confirmed = window.confirm(`确认删除转盘 “${wheel.name}”？`);
    if (!confirmed) {
      return;
    }
    state.appState.wheels = state.appState.wheels.filter((item) => item.id !== wheel.id);
    state.appState.currentWheelId = state.appState.wheels[0].id;
    persistState();
    renderWheelSelector();
    syncEditorFromActiveWheel();
    renderWheel();
    showStatus('已删除当前转盘');
  }

  function renameCurrentWheel() {
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }
    const name = window.prompt('请输入新名称', wheel.name);
    if (!name) {
      return;
    }
    wheel.name = name;
    persistState();
    renderWheelSelector();
    showStatus('已重命名');
  }

  function updateActionButtonsState() {
    const hasResult = Boolean(state.currentResult);
    elements.eliminateButton.disabled = !hasResult;
    elements.keepButton.disabled = !hasResult;
  }

  function openHistoryModal() {
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }
    elements.historyList.innerHTML = '';
    if (!wheel.history || !wheel.history.length) {
      const item = document.createElement('li');
      item.textContent = '暂无历史记录';
      elements.historyList.appendChild(item);
    } else {
      wheel.history.forEach((entry) => {
        const item = document.createElement('li');
        item.textContent = entry;
        elements.historyList.appendChild(item);
      });
    }
    elements.historyModal.classList.add('open');
    elements.historyModal.setAttribute('aria-hidden', 'false');
  }

  function closeHistoryModal() {
    closeModal(elements.historyModal);
  }

  function clearHistory() {
    const wheel = getActiveWheel();
    if (!wheel) {
      return;
    }
    wheel.history = [];
    persistState();
    openHistoryModal();
    showStatus('已清空历史');
  }

  function persistState() {
    RandomWheelStorage.saveState(state.appState);
  }

  function showStatus(message) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.classList.add('show');
    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(() => {
      elements.statusMessage.classList.remove('show');
    }, 1600);
  }

  init();
})();
