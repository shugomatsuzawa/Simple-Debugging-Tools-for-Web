// Quick Admin 設定を browser.storage.local で管理するヘルパー群
const STORAGE_KEY = 'quickAdmins';

// ストレージから取り出した値を必ず同じ構造の配列に整える
function normalizeList(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item) => item && typeof item === 'object' && typeof item.id === 'string')
        .map((item) => normalizeEntry(item));
}

// 各エントリに欠損プロパティがあっても扱えるよう正規化する
function normalizeEntry(entry) {
    return {
        id: String(entry.id),
        name: typeof entry.name === 'string' ? entry.name : '',
        domains: Array.isArray(entry.domains)
            ? entry.domains
                .map((domain) => (typeof domain === 'string' ? domain.trim() : ''))
                .filter(Boolean)
            : [],
        path: typeof entry.path === 'string' ? entry.path : ''
    };
}

// 全エントリを取得
export async function loadQuickAdmins() {
    const stored = await browser.storage.local.get(STORAGE_KEY);
    return normalizeList(stored[STORAGE_KEY]);
}

// エントリ配列をまるごと保存
export async function saveQuickAdmins(entries) {
    const normalized = normalizeList(entries);
    await browser.storage.local.set({ [STORAGE_KEY]: normalized });
    return normalized;
}

// ID を基準に追加 or 更新を行う
export async function upsertQuickAdmin(entry) {
    const nextEntry = normalizeEntry(entry);
    const list = await loadQuickAdmins();
    const index = list.findIndex((item) => item.id === nextEntry.id);
    const next = index === -1
        ? [...list, nextEntry]
        : list.map((item, idx) => (idx === index ? nextEntry : item));
    await saveQuickAdmins(next);
    return next;
}

// 指定 ID を削除
export async function deleteQuickAdmin(id) {
    const list = await loadQuickAdmins();
    const next = list.filter((item) => item.id !== id);
    await saveQuickAdmins(next);
    return next;
}

// storage.onChanged を購読し、変更のたびに配列を渡す
export function subscribeQuickAdmins(callback) {
    if (typeof callback !== 'function') {
        return () => {};
    }

    const handler = (changes, areaName) => {
        if (areaName !== 'local' || !changes[STORAGE_KEY]) {
            return;
        }
        callback(normalizeList(changes[STORAGE_KEY].newValue));
    };

    browser.storage.onChanged.addListener(handler);
    return () => {
        browser.storage.onChanged.removeListener(handler);
    };
}

// UUID を発行（crypto.randomUUID が使える環境前提）
export function createQuickAdminId() {
    return crypto.randomUUID();
}

export const QUICK_ADMIN_STORAGE_KEY = STORAGE_KEY;
