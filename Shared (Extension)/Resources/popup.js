const alertEnable   = document.getElementById('alert_enable');
const alertHostname = document.getElementById('alert_hostname');
const alertSave     = document.getElementById('alert_save');

const infoBtn       = document.getElementById('info_btn');

// ポップアップ開いた時に設定内容表示
browser.storage.local.get(['alertEnable', 'alertHostname'], function (result) {
    const savedAlertEnable      = result.alertEnable;
    const savedAlertHostname    = result.alertHostname;
    alertEnable.checked = savedAlertEnable;
    alertHostname.value = savedAlertHostname;
});

document.addEventListener('DOMContentLoaded', function () {
    // 保存ボタンクリック
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

    // iボタンクリック
    infoBtn.addEventListener('click', function () {
        let createInfoData = {
          url: "acknowledgements.html"
        };
        let creatingInfo = browser.tabs.create(createInfoData);
    });
});
