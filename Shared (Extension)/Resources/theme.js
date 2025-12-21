(() => {
    const root = document.documentElement;
    if (!root) {
        return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
        root.classList.toggle('dark', mediaQuery.matches);
    };

    applyTheme();

    if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', applyTheme);
    } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(applyTheme);
    }
})();
