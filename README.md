# シンプルWebデバッグツール
<a href="https://apps.apple.com/jp/app/%E3%82%B7%E3%83%B3%E3%83%97%E3%83%ABweb%E3%83%87%E3%83%90%E3%83%83%E3%82%B0%E3%83%84%E3%83%BC%E3%83%AB/id6479216231?itsct=apps_box_badge&amp;itscg=30200" style="display: inline-block; overflow: hidden; border-radius: 13px; width: 250px; height: 83px;"><img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/ja-jp?size=250x83&amp;releaseDate=1711324800" alt="Download on the App Store" style="border-radius: 13px; width: 120px; height: 40px;"></a>

Web開発中のデバッグに役立つちょっとした機能をまとめた、シンプルなブラウザ拡張機能です。  
この拡張機能はSafariのために作られていますが、一部の機能はWebExtensions APIに対応した他のブラウザでもお使いいただけます。
- 外部サイト移動アラート
    - あなたが指定したドメインと異なるページに移動した際に画面上部でお知らせします。  
      例えばステージング環境でWebサイトのテストをする際、誤って本番環境に接続されているリンクをタップした場合、この機能を使えばすぐに気づくことができます。
- Titleタグの取得
    - 現在開いているタブのTitleタグテキストを取得し、コピーしやすいフィールドを表示します。
- Windowsインターネットショートカットの作成（Windows以外のみ）
    - 現在のページのロケーションをWindowsインターネットショートカット（```.url```ファイル）で出力します。  
      他プラットフォームのユーザーにWebサイトのショートカットを共有することができます。  
      （Apple M1以降のチップを搭載したMacでファイルをローカルに保存する場合、[Shareful](https://sindresorhus.com/shareful) を使うと便利です）

今後他にも機能を追加するかもしれません。

## ローカルで実行する
1. node.jsおよびnpm等のパッケージマネージャーをインストールします。
1. 次のコマンドを実行して、リポジトリをクローンします。
    ```sh
    git clone git@github.com:shugomatsuzawa/Simple-Debugging-Tools-for-Web.git
    ```
1. 次のコマンドを実行して、依存関係をインストールします。
    ```sh
    cd "Shared (Extension)/Resources"
    npm install
    ```
1. ブラウザで実行します。
    - Safariの場合 : Xcodeでビルドします。
    - その他のブラウザの場合 : ブラウザのデベロッパーモードで、```Shared (Extension)/Resources```ディレクトリを読み込みます。

## CSSクラス(Tailwind CSS)を編集する場合
CSSを編集する場合は、Tailwind CSSで作ったCSSを再度ビルドする必要があります。
```sh
# Shared (Extension)/Resourcesに移動
cd "Shared (Extension)/Resources"

# ビルドする
npm install
npx tailwindcss -i ./tailwind.css -o ./style.css --minify
```

## 貢献する
バグを見つけた場合は、[GitHub Issues](https://github.com/shugomatsuzawa/Simple-Debugging-Tools-for-Web/issues)からできるだけ詳しい再現手順を教えていただけると助かります。  
感想などありましたら私の[Webサイト](https://shugomatsuzawa.com/contact/)やソーシャルメディアからお気軽にご連絡ください。
