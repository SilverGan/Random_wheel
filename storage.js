(function () {
  const STORAGE_KEY = 'random-wheel-state-v1';

  function createWheel(name, items) {
    const normalizedItems = normalizeItems(items);
    return {
      id: `wheel-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name: name || '新转盘',
      items: normalizedItems,
      originalItems: normalizedItems.slice(),
      history: []
    };
  }

  function normalizeItems(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  function buildDefaultState() {
    const wheel = createWheel('默认转盘', ['苹果', '香蕉', '西瓜', '葡萄']);
    return {
      wheels: [wheel],
      currentWheelId: wheel.id
    };
  }

  function normalizeState(input) {
    if (!input || !Array.isArray(input.wheels)) {
      return buildDefaultState();
    }

    const wheels = input.wheels
      .map((wheel) => {
        const items = normalizeItems(wheel.items);
        const originalItems = normalizeItems(wheel.originalItems);
        const history = Array.isArray(wheel.history)
          ? wheel.history.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)
          : [];

        const safeItems = items.length ? items : originalItems.length ? originalItems : [];
        const safeOriginalItems = originalItems.length ? originalItems : safeItems.slice();

        return {
          id: wheel.id || `wheel-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          name: wheel.name || '新转盘',
          items: safeItems,
          originalItems: safeOriginalItems,
          history
        };
      })
      .filter((wheel) => wheel && wheel.name);

    if (!wheels.length) {
      return buildDefaultState();
    }

    const currentWheelId = input.currentWheelId && wheels.some((wheel) => wheel.id === input.currentWheelId)
      ? input.currentWheelId
      : wheels[0].id;

    return {
      wheels,
      currentWheelId
    };
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return buildDefaultState();
    }

    try {
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      return buildDefaultState();
    }
  }

  function exportState(state) {
    return JSON.stringify(normalizeState(state), null, 2);
  }

  window.RandomWheelStorage = {
    createWheel,
    normalizeState,
    saveState,
    loadState,
    exportState
  };
})();
