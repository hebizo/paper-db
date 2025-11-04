# Paper DB

Paper DB は、研究論文や技術資料を一元管理するための Rails + React アプリケーションです。論文タイトルや著者、タグ、URL、Markdown メモに加えて PDF ファイルを保存でき、ブラウザから参照・編集・検索ができます。

## 動作環境 (Prerequisites)
- Ruby 3.4.3
- Node.js 18 以上 (Vite 5.x の要件、`package.json` に `vite@^5.4.19` を指定)
- SQLite3 ライブラリ
- Bundler / npm (または Node.js 付属の npm)

## セットアップ手順
1. 依存関係をインストール
   - `bundle install`
   - `npm install`
2. データベースを作成・初期化
   - `bin/rails db:setup`

## 開発サーバーの起動
- `bin/dev`
  - Rails サーバー (`bin/rails server`) と Vite 開発サーバー (`bin/vite dev`) を並列起動します ([`bin/dev`](bin/dev), [`Procfile.dev`](Procfile.dev))
- 既定では http://localhost:3000 でアプリケーションにアクセスできます
