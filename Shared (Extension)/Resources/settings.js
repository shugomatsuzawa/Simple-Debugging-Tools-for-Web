import {
    createQuickAdminId,
    deleteQuickAdmin,
    loadQuickAdmins,
    subscribeQuickAdmins,
    upsertQuickAdmin
} from './quickAdminStore.js';

// DOMContentLoaded 後に初期化するユーティリティ
const ready = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
        callback();
    }
};

// 設定画面のクイックアドミン CRUD を初期化
ready(() => {
    const listEl = document.getElementById('quick-admin-list');
    const emptyEl = document.getElementById('quick-admin-empty');
    const template = document.getElementById('quick-admin-item-template');
    const addBtn = document.getElementById('quick-admin-add');
    const dialog = document.getElementById('dialog-edit-quick-admin-item');
    const form = document.getElementById('quick-admin-form');
    const errorEl = document.getElementById('quick-admin-form-error');

    if (!listEl || !template || !addBtn || !dialog || !form) {
        console.error('Quick Admin UI 要素が見つかりませんでした。');
        return;
    }

    const fields = {
        name: document.getElementById('dialog-edit-quick-admin-item-name'),
        domains: document.getElementById('dialog-edit-quick-admin-item-target-domain'),
        path: document.getElementById('dialog-edit-quick-admin-item-path'),
        custom: document.getElementById('dialog-edit-quick-admin-item-custom')
    };

    const state = {
        items: [],
        editingId: null,
        unsubscribe: null
    };

    init();

    async function init() {
        try {
            state.items = await loadQuickAdmins();
        } catch (error) {
            console.error('クイックアドミンの読み込みに失敗しました。', error);
            state.items = [];
        }
        renderList();

        // 他タブで変更された場合も即座に反映
        state.unsubscribe = subscribeQuickAdmins((list) => {
            state.items = list;
            renderList();
        });

        addBtn.addEventListener('click', () => openDialog());
        form.addEventListener('submit', handleSubmit);
        dialog.querySelectorAll('[data-dialog-close]').forEach((button) => {
            button.addEventListener('click', closeDialog);
        });
        dialog.addEventListener('close', () => {
            state.editingId = null;
            form.reset();
            clearError();
        });

        // 編集/削除ボタンはイベントデリゲーションで処理
        listEl.addEventListener('click', (event) => {
            const actionButton = event.target.closest('[data-action]');
            if (!actionButton) {
                return;
            }
            const container = actionButton.closest('[data-quick-admin-id]');
            if (!container) {
                return;
            }
            const { quickAdminId } = container.dataset;
            const target = state.items.find((item) => item.id === quickAdminId);
            if (!target) {
                return;
            }
            if (actionButton.dataset.action === 'edit') {
                openDialog(target);
            } else if (actionButton.dataset.action === 'delete') {
                handleDelete(target);
            }
        });

        window.addEventListener('beforeunload', () => {
            if (typeof state.unsubscribe === 'function') {
                state.unsubscribe();
            }
        });
    }

    // 現在の state.items から一覧 DOM を再構築
    function renderList() {
        listEl.innerHTML = '';
        if (!state.items.length) {
            if (emptyEl) {
                emptyEl.hidden = false;
            }
            return;
        }
        if (emptyEl) {
            emptyEl.hidden = true;
        }

        const fragment = document.createDocumentFragment();
        state.items.forEach((item) => {
            const clone = template.content.cloneNode(true);
            const article = clone.querySelector('[data-quick-admin-id]');
            const nameEl = clone.querySelector('[data-field="name"]');
            const destinationEl = clone.querySelector('[data-field="destination"]');
            const domainEl = clone.querySelector('[data-field="domains"]');

            if (article) {
                article.dataset.quickAdminId = item.id;
            }
            if (nameEl) {
                nameEl.textContent = item.name || '名称未設定';
            }
            if (destinationEl) {
                destinationEl.textContent = formatDestination(item);
            }
            if (domainEl) {
                domainEl.textContent = formatDomains(item);
            }
            fragment.appendChild(clone);
        });
        listEl.appendChild(fragment);
    }

    // item があれば編集、なければ新規としてダイアログを開く
    function openDialog(item) {
        state.editingId = item?.id ?? null;
        clearError();
        form.reset();
        fields.name.value = item?.name ?? '';
        fields.domains.value = (item?.domains ?? []).join(', ');
        fields.path.value = item?.path ?? '';
        fields.custom.value = item?.custom ?? '';
        dialog.showModal();
        fields.name.focus();
    }

    function closeDialog() {
        if (dialog.open) {
            dialog.close();
        }
    }

    // フォーム送信時に入力チェック＆ストレージ更新
    async function handleSubmit(event) {
        event.preventDefault();
        clearError();

        const name = fields.name.value.trim();
        const path = fields.path.value.trim();
        const custom = fields.custom.value.trim();
        const domains = parseDomains(fields.domains.value);

        if (!name) {
            return showError('名称を入力してください。');
        }
        if (!path) {
            return showError('URLパス置換文字列を入力してください。');
        }

        const entry = {
            id: state.editingId ?? createQuickAdminId(),
            name,
            domains,
            path,
            custom
        };

        try {
            state.items = await upsertQuickAdmin(entry);
            renderList();
            closeDialog();
        } catch (error) {
            console.error('クイックアドミンの保存に失敗しました。', error);
            showError('保存中に問題が発生しました。もう一度お試しください。');
        }
    }

    // 文字列をカンマ区切りで分割しドメインだけの配列に整える
    function parseDomains(value) {
        return value
            .split(',')
            .map((domain) => domain.trim())
            .map((domain) => domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, ''))
            .map((domain) => domain.toLowerCase())
            .filter(Boolean);
    }

    // 一覧表示用の URL 情報を整形
    function formatDestination(item) {
        if (item.custom) {
            return item.custom;
        }
        if (item.path) {
            return item.path;
        }
        return 'URL未設定';
    }

    // 一覧で対象ドメインを分かりやすく表示
    function formatDomains(item) {
        if (!item.domains || item.domains.length === 0) {
            return '対象: すべてのドメイン';
        }
        return `対象: ${item.domains.join(', ')}`;
    }

    // 削除確認ののちに対象 ID を削除
    async function handleDelete(target) {
        const confirmed = window.confirm(`「${target.name || '名称未設定'}」を削除しますか？`);
        if (!confirmed) {
            return;
        }
        try {
            state.items = await deleteQuickAdmin(target.id);
            renderList();
            if (dialog.open && state.editingId === target.id) {
                closeDialog();
            }
        } catch (error) {
            console.error('クイックアドミンの削除に失敗しました。', error);
            showError('削除に失敗しました。しばらくしてから再度お試しください。');
        }
    }

    // エラー表示をまとめる
    function showError(message) {
        if (!errorEl) {
            window.alert(message);
            return;
        }
        errorEl.textContent = message;
        errorEl.hidden = false;
    }

    // エラー表示をクリア
    function clearError() {
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.hidden = true;
        }
    }
});
