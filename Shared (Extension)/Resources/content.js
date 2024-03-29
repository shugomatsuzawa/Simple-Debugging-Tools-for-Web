function exitAlert() {
    browser.storage.local.get(['alertEnable', 'alertHostname']).then(function (result) {
        const savedAlertEnable      = result.alertEnable;
        const savedAlertHostname    = result.alertHostname;
        if(savedAlertEnable && savedAlertHostname){
            console.log('Saved URL retrieved:', savedAlertHostname);
            
            if( location.hostname != savedAlertHostname){
                console.log('⚠︎ ' + savedAlertHostname + 'ではありません');
                // 要素を作成
                const alert_elm = document.createElement('div');
                alert_elm.className = 'sm-sdtfw-alert-elm';
                
                // Textを追加
                alert_elm.textContent = '⚠︎ ' + savedAlertHostname + 'ではありません';
                
                // 親要素の最後の子要素として追加する
                document.body.appendChild(alert_elm);
                
                // 既存のmeta要素を変更する
                const existingMeta = document.querySelector('meta[name="theme-color"]');
                if (existingMeta) {
                    existingMeta.remove();
                }
                // meta要素を新しく追加する
                const themeColor = document.createElement('meta');
                themeColor.name = 'theme-color';
                themeColor.content = '#FF3B30';
                document.head.appendChild(themeColor);
            }
        }
    });
}

// 既存のページ読み込み時に実行
exitAlert();
