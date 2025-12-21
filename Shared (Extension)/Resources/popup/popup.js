// クイックアドミンの設定を読み込み・購読する
import { loadQuickAdmins, subscribeQuickAdmins } from '../quickAdminStore.js';

const alertEnable   = document.getElementById('alert_enable');
const alertHostname = document.getElementById('alert_hostname');
const alertSave     = document.getElementById('alert_save');

const getTitle      = document.getElementById('get_title');

const urlFileField  = document.getElementById('url_file_field');
const urlFileSave   = document.getElementById('url_file_save');

const infoBtn       = document.getElementById('info_btn');
const settingsBtn   = document.getElementById('settings_btn');

// UAチェック
function uaData() {
    // User-Agent Client Hintsが利用できる場合
    if (window.navigator.userAgentData) {
        const uaData = navigator.userAgentData;
        const brands = uaData.brands; // ブランド情報を取得
        const os = uaData.platform; // OS情報。"macOS"など
        const ret = {brands: brands, os: os};
        return ret;
    }
    return false;
}

// ポップアップ開いた時に設定内容表示
browser.storage.local.get(['alertEnable', 'alertHostname']).then(function (result) {
    const savedAlertEnable      = result.alertEnable;
    const savedAlertHostname    = result.alertHostname;
    alertEnable.checked = savedAlertEnable;
    alertHostname.value = savedAlertHostname ?? '';
});

document.addEventListener('DOMContentLoaded', function () {
    // 外部サイト移動アラート
    alertSave.addEventListener('click', function () {
        // 入力されたURLをブラウザストレージに保存する
        const alertEnableValue      = alertEnable.checked;
        const alertHostnameValue    = alertHostname.value;
        browser.storage.local.set({
            'alertEnable': alertEnableValue,
            'alertHostname': alertHostnameValue
        }).then(function () {
            console.log('URL and Toggle State saved:', alertHostnameValue, alertEnableValue);
            
            // 現在のアクティブなタブを取得する
            browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
                const activeTab = tabs[0];
                // アクティブなタブをリロードする
                browser.tabs.reload(activeTab.id);
                // popupを閉じる
                window.close();
            });
        });
    });

    // Titleタグの取得
    browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        getTitle.value = tabs[0].title;
    });
    
    // Windowsインターネットショートカットの作成（Windows以外）
    // ブラウザチェック
    if (navigator.share && uaData().os != 'Windows') {
        urlFileSave.addEventListener('click', function () {
            browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
                const url = tabs[0].url;
                const title = tabs[0].title;
                // URLをファイルに保存
                if (url && title) {
                    saveURLToFile(url, title);
                }
            });
        });
    } else {
        // 非対応ブラウザでボタン非表示
        urlFileField.classList.add("hidden");
    }

    async function saveURLToFile(url, title) {
        if (navigator.share) {
            try {
                const shareData = '[InternetShortcut]\nURL=' + url;
                const blob = new Blob([shareData], { type: 'text/plain' });
                const file = new File([blob], title + '.url');
                await navigator.share({ files: [file] });
                console.log('URL shared successfully.');
            } catch (error) {
                alert('Error sharing URL:', error);
            }
        }
    }

    // iボタンクリック
    infoBtn.addEventListener('click', function () {
        let createInfoData = {
            url: "settings/about.html"
        };
        let creatingInfo = browser.tabs.create(createInfoData);
    });

    // 設定ボタンクリック
    settingsBtn.addEventListener('click', function () {
        let createSettingsData = {
            url: "settings/settings.html"
        };
        let creatingSettings = browser.tabs.create(createSettingsData);
    });

    initQuickAdminSection();
});

async function initQuickAdminSection() {
    const container = document.getElementById('quick-admin-buttons');
    const emptyEl = document.getElementById('quick-admin-empty');
    const template = document.getElementById('quick-admin-button-template');

    if (!container || !template) {
        return;
    }

    const state = {
        tab: null,
        items: [],
        unsubscribe: null
    };

    try {
        state.tab = await getActiveTab();
    } catch (error) {
        console.error('アクティブタブの取得に失敗しました。', error);
    }

    await refreshItems();
    render();

    // 設定画面等で変更されたら即描画内容を更新
    state.unsubscribe = subscribeQuickAdmins((list) => {
        state.items = list;
        render();
    });

    // ボタンクリックで対応 URL を生成し新規タブを開く
    container.addEventListener('click', (event) => {
        const button = event.target.closest('[data-quick-admin-id]');
        if (!button) {
            return;
        }
        const target = state.items.find((item) => item.id === button.dataset.quickAdminId);
        if (!target || !state.tab) {
            return;
        }
        openQuickAdminTab(target, state.tab);
    });

    window.addEventListener('unload', () => {
        if (typeof state.unsubscribe === 'function') {
            state.unsubscribe();
        }
    });

    // storage から最新の一覧を取得
    async function refreshItems() {
        try {
            state.items = await loadQuickAdmins();
        } catch (error) {
            console.error('クイックアドミン設定の取得に失敗しました。', error);
            state.items = [];
        }
    }

    // 現在タブのホスト名に合うボタンだけ描画
    function render() {
        container.innerHTML = '';
        const hostname = getHostname(state.tab?.url);
        const list = hostname ? filterByHostname(state.items, hostname) : [];

        if (!list.length) {
            if (emptyEl) {
                emptyEl.hidden = false;
            }
            return;
        }

        if (emptyEl) {
            emptyEl.hidden = true;
        }

        const fragment = document.createDocumentFragment();
        list.forEach((item) => {
            const clone = template.content.cloneNode(true);
            const button = clone.querySelector('[data-quick-admin-id]');
            if (button) {
                button.dataset.quickAdminId = item.id;
                button.textContent = item.name || formatDestination(item);
                button.title = formatDestination(item);
            }
            fragment.appendChild(clone);
        });
        container.appendChild(fragment);
    }
}

// ボタンのタイトルに使う表示用 URL
function formatDestination(item) {
    if (item.path) {
        return item.path;
    }
    return '';
}

// domains 条件に一致するエントリだけを返す
function filterByHostname(items, hostname) {
    if (!hostname) {
        return [];
    }
    return items.filter((item) => {
        if (!item.domains || item.domains.length === 0) {
            return true;
        }
        return item.domains.some((domain) => {
            if (hostname === domain) {
                return true;
            }
            return hostname.endsWith(`.${domain}`);
        });
    });
}

// 現在のタブ情報を取得
async function getActiveTab() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
}

// URL からホスト名を抽出
function getHostname(url) {
    if (!url) {
        return '';
    }
    try {
        return new URL(url).hostname.toLowerCase();
    } catch (error) {
        console.error('URL 解析に失敗しました。', error);
        return '';
    }
}

// 生成した URL を新しいタブで開く
function openQuickAdminTab(entry, tab) {
    const targetUrl = buildQuickAdminUrl(entry, tab.url);
    if (!targetUrl) {
        window.alert('URL を生成できませんでした。設定を確認してください。');
        return;
    }
    console.debug('targetUrl ', targetUrl);
    browser.tabs.create({ url: targetUrl });
}

// path 設定をもとに遷移先 URL を構築
function buildQuickAdminUrl(entry, tabUrl) {
    if (!tabUrl) {
        return null;
    }
    const current = new URL(tabUrl);

    const normalizedPath = normalizeRelativePath(entry.path);
    if (!normalizedPath) {
        return null;
    }

    const currentRoot = new URL("/", tabUrl);
    const currentBaseUrl = currentRoot.href.slice(0, -1); // NOTE: currentRoot は / で終わる
    console.debug('buildQuickAdminUrl', {'current': current.href, 'currentBaseUrl': currentBaseUrl, 'normalizedPath': normalizedPath})
    return currentBaseUrl + normalizedPath;
}

// 相対パスを URL コンストラクタで解決できる形に整える
function normalizeRelativePath(path) {
    if (!path) {
        return '';
    }
    if (path.startsWith('/') || path.startsWith('?') || path.startsWith('#') || path.startsWith(':')) {
        return path;
    }
    return `/${path}`;
}
