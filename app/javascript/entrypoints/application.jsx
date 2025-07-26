import React from 'react';
import ReactDOM from 'react-dom/client';

// これがReactアプリケーションの本体となるコンポーネント
function App() {
  return (
    <div>
      <h1>Good Evening from React!</h1>
      <p>This component is rendered inside the 'root' div.</p>
    </div>
  );
}

// DOMの読み込みが完了したら実行
document.addEventListener('DOMContentLoaded', () => {
  // 'root'というIDを持つ要素を取得
  const rootEl = document.getElementById('root');
  if (rootEl) {
    // その要素をルートとしてReactアプリケーションを描画
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});