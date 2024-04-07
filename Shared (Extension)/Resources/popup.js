const alertEnable   = document.getElementById('alert_enable');
const alertHostname = document.getElementById('alert_hostname');
const alertSave     = document.getElementById('alert_save');

const getTitle      = document.getElementById('get_title');

const urlFileField  = document.getElementById('url_file_field');
const urlFileSave   = document.getElementById('url_file_save');

const infoBtn       = document.getElementById('info_btn');

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
          url: "about.html"
        };
        let creatingInfo = browser.tabs.create(createInfoData);
    });
});
