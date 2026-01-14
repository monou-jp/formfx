import { FormFx } from './core/FormFx';

/**
 * Browser Global Support
 * <script>タグで読み込まれた際、自動的に window.FormFx に登録します
 */
if (typeof window !== 'undefined') {
    // tsupのiife(globalName)を使っている場合、
    // エクスポート全体が window.FormFx に代入される。
    // その中の FormFx クラスを window.FormFx に直接上書きすることで
    // ユーザーが new FormFx() として直感的に使えるようにする。
    if ((window as any).FormFx && (window as any).FormFx.FormFx) {
        // すでに代入されている場合は即座に。
        (window as any).FormFx = (window as any).FormFx.FormFx;
    } else {
        // まだの場合はタイミングを待つ（tsupのIIFEの戻り値が代入されるタイミングに合わせる）
        setTimeout(() => {
            if ((window as any).FormFx && (window as any).FormFx.FormFx) {
                (window as any).FormFx = (window as any).FormFx.FormFx;
            }
        }, 0);
    }
}

export { FormFx };
export * from './public-types';