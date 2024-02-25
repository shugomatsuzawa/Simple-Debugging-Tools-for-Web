const alertEnable   = document.getElementById('alert_enable');
const alertHostname = document.getElementById('alert_hostname');
const alertSave     = document.getElementById('alert_save');

const copyTitle     = document.getElementById('copy_title');
const copiedTitle   = document.getElementById('copied_title');

const infoBtn       = document.getElementById('info_btn');

// ポップアップ開いた時に設定内容表示
browser.storage.local.get(['alertEnable', 'alertHostname'], function (result) {
    const savedAlertEnable      = result.alertEnable;
    const savedAlertHostname    = result.alertHostname;
    alertEnable.checked = savedAlertEnable;
    alertHostname.value = savedAlertHostname;
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
        }, function () {
            console.log('URL and Toggle State saved:', alertHostnameValue, alertEnableValue);
            
            // 現在のアクティブなタブを取得する
            browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const activeTab = tabs[0];
                // アクティブなタブをリロードする
                browser.tabs.reload(activeTab.id);
                // popupを閉じる
                window.close();
            });
        });
    });
    
    // Titleタグのコピー
    copyTitle.addEventListener('click', function () {
        // クリップボードにコピーするためのテキストを取得
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log('title: ' + tabs[0].title);
            // テキストをクリップボードにコピー
            navigator.clipboard.writeText(tabs[0].title).then(
                () => {
                    /* clipboard successfully set */
                    console.log('clipboard successfully set');
                    // 「コピーしました。」表示
                    copiedTitle.classList.remove('hidden');
                },
                () => {
                    /* clipboard write failed */
                    console.error('clipboard write failed');
                },
            );
        });
    });

    // iボタンクリック
    infoBtn.addEventListener('click', function () {
        let createInfoData = {
          url: "acknowledgements.html"
        };
        let creatingInfo = browser.tabs.create(createInfoData);
    });
});
