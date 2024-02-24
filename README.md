# 離脱アラート（Webデバッグツール）
Web開発中のデバッグに役立つ、非常にシンプルなブラウザ拡張機能（Safari用）です。
- 外部サイト移動アラート
    - 指定したドメインと異なるページに移動した際にお知らせします。ステージング環境化でのテスト時等、事故防止に役立ちます。
今後他にも便利な機能を追加するかもしれません。

## CSSクラス(Tailwind CSS)を編集する場合
CSSを編集する場合は、Tailwind CSSで作ったCSSを再度ビルドする必要があります。
```sh
# Shared (Extension)/Resourcesに移動
cd "Shared (Extension)/Resources"

# ビルドする
npm install
npx tailwindcss -i ./tailwind.css -o ./popup.css --minify
```

## 貢献する
バグを見つけた場合は、[GitHub Issues](https://github.com/shugomatsuzawa/Simple-Debugging-Tools-for-Web/issues)からできるだけ詳しい再現手順を教えていただけると助かります。  
感想などありましたら私の[Webサイト](https://shugomatsuzawa.com/contact/)やソーシャルメディアからお気軽にご連絡ください。
