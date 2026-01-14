# FormFx

強力で軽量、かつ宣言的なフォーム制御ライブラリ。

FormFxを使用すると、複雑なJavaScriptを書いたり重いフレームワークに頼ったりすることなく、シンプルなデータ属性やJSONルールを使用して、動的なフォーム動作（表示/非表示、有効/無効、バリデーション）を管理できます。

## なぜ FormFx なのか？

- **メンテナンス性の向上**: jQueryやVanilla JSのスパゲッティコードを回避できます。
- **軽量**: フル機能のフォームエンジンに比べてオーバーヘッドが最小限です。
- **宣言的**: `data-fx-*` 属性を使用して、ロジックをHTML内に配置できます。
- **安全**: `eval()` や `new Function()` を使用しません。式は安全に評価されます。
- **フレームワークに依存しない**: あらゆる環境で動作します。

## インストール

```bash
npm install formfx
```

または CDN 経由:
```html
<script src="https://unpkg.com/formfx/dist/index.js"></script>
```

## クイックスタート (属性ベース)

HTMLのデータ属性を使用してルールを定義するだけです。

```html
<form id="my-form">
  <input type="checkbox" id="toggle" name="toggle">
  
  <div data-fx-show="toggle == true">
    <p>このセクションはチェックボックスがオンのときだけ表示されます。</p>
    <input type="text" name="optional_field" data-fx-required="toggle == true">
  </div>
</form>

<script type="module">
  import { FormFx } from 'formfx';
  const fx = new FormFx(document.getElementById('my-form'));
  fx.mount();
</script>
```

## JSON ルール (高度な使い方)

より複雑なロジックや、HTMLをクリーンに保ちたい場合に使用します。JSONルールは属性ベースのルールよりも優先されます。

```javascript
const fx = new FormFx(form, {
  rules: [
    {
      if: "total > 1000",
      then: [
        { show: "#discount-section" },
        { required: "#coupon-code" }
      ]
    }
  ]
});
```

## リピーター (Repeater)

動的な行の追加・削除を簡単に処理できます。

```html
<div data-fx-repeater="items" data-fx-min="1" data-fx-max="5">
  <div data-fx-list>
    <template>
      <div data-fx-item>
        <input type="text" data-fx-field="name">
        <button type="button" data-fx-remove-btn>削除</button>
      </div>
    </template>
  </div>
  <button type="button" data-fx-add-btn>アイテムを追加</button>
</div>
```

### 行コンテキスト (`@row.field`)

同じリピーター行内のフィールドを参照します。

```html
<input type="number" data-fx-field="price">
<div data-fx-show="@row.price > 100">高額アイテムです！</div>
```

## 永続化 (Persistence)

フォームルールの状態を自動的に保存・復元します。

```javascript
const fx = new FormFx(form, {
  persist: {
    key: 'my-form-settings',
    storage: 'localStorage'
  }
});
```

## ルールエディタ (オプションのアドオン)

フォームルールのためのビジュアルエディタです。

```javascript
import { FormFx } from 'formfx';
// メインバンドルを小さく保つため、エディタは個別にインポートします
import { RuleEditor } from 'formfx/editor';
import 'formfx/editor.css';

const fx = new FormFx(form);
fx.mount();

const editor = new RuleEditor(fx, {
  mount: document.getElementById('editor-container'),
  mode: 'json'
});
editor.mount();
```

## デバッグパネル

開発用のビジュアルデバッグ情報。

```javascript
const fx = new FormFx(form, { debug: true });
```

## API リファレンス

### `FormFxOptions`
- `disableOnHide`: Boolean (デフォルト `true`)
- `clearOnHide`: Boolean (デフォルト `false`)
- `rules`: `JSONRule[]`
- `persist`: `PersistOptions`
- `debug`: Boolean

### `FormFx` メソッド
- `mount()`: リスナーとオブザーバーを初期化します。
- `destroy()`: すべてをクリーンアップします（リスナーとオブザーバーを削除）。
- `pause()` / `resume()`: ルールの評価を一時停止または再開します。
- `reEvaluate()`: 手動で評価をトリガーします。
- `exportRules()`: 現在のJSONルールを取得します。
- `importRules(rules)`: 新しいJSONルールを読み込みます。
- `enableRule(ruleId)` / `disableRule(ruleId)`: IDでJSONルールを制御します。

## 互換性

- モダンブラウザ (Chrome, Firefox, Safari, Edge)
- `eval()` を使用していません。厳格な CSP 環境でも安全です。

## セキュリティ

- 独自のトークナイザーとパーサーにより、式は特定の安全な操作のみ実行可能です。
- 式の中から `window` や `document` などのグローバルオブジェクトにはアクセスできません。

## ロードマップ

- **v1.1**: 式内での非同期関数のサポート。
- **v2.0**: カスタムエフェクト用のプラグインシステム。

## ライセンス

BSD 3-Clause License

### 貢献に関する同意
本リポジトリへの貢献（プルリクエスト等）を行う場合、寄与者ライセンス同意書（CLA）に同意したものとみなされます。これには著作者人格権の不行使や、オーナーによる将来のライセンス変更・商用製品への組み込みの許可が含まれます。詳細は [CONTRIBUTING.ja.md](CONTRIBUTING.ja.md) をご確認ください。