# シンプルWebデバッグツール
Web開発中のデバッグに役立つちょっとした機能をまとめた、シンプルなブラウザ拡張機能（Safari用）です。
- 外部サイト移動アラート
    - あなたが指定したドメインと異なるページに移動した際に画面上部でお知らせします。  
      例えばステージング環境でWebサイトのテストをする際、誤って本番環境に接続されているリンクをタップした場合、この機能を使えばすぐに気づくことができます。
- Titleタグの取得
    - 現在開いているタブのTitleタグテキストを取得し、コピーしやすいフィールドを表示します。

今後他にも機能を追加するかもしれません。

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
