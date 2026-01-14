import { DebugInfo, PersistOptions } from '../../types';

export class DebugPanel {
  private container: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private persistInfo: PersistOptions | null = null;
  private isMinimized = false;
  private pos = { x: 10, y: 10 };
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };

  constructor() {
    this.loadState();
    this.container = document.createElement('div');
    this.container.id = 'formfx-debug-panel';
    this.shadow = this.container.attachShadow({ mode: 'open' });
    this.renderInitial();
    document.body.appendChild(this.container);
    this.setupDragging();
  }

  private loadState() {
    try {
      const saved = localStorage.getItem('formfx-debug-state');
      if (saved) {
        const state = JSON.parse(saved);
        this.isMinimized = !!state.isMinimized;
        if (state.pos) this.pos = state.pos;
      }
    } catch (e) {
      // Ignore
    }
  }

  private saveState() {
    try {
      localStorage.setItem('formfx-debug-state', JSON.stringify({
        isMinimized: this.isMinimized,
        pos: this.pos
      }));
    } catch (e) {
      // Ignore
    }
  }

  private setupDragging() {
    if (!this.shadow || !this.container) return;
    const header = this.shadow.querySelector('.header') as HTMLElement;
    if (!header) return;

    header.style.cursor = 'move';
    header.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStart = {
        x: e.clientX + this.pos.x,
        y: e.clientY + this.pos.y
      };
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.pos.x = this.dragStart.x - e.clientX;
      this.pos.y = this.dragStart.y - e.clientY;
      this.updatePosition();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.saveState();
      }
    });

    const toggleBtn = this.shadow.getElementById('toggle-minimize');
    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isMinimized = !this.isMinimized;
      this.renderInitial();
      this.updatePosition();
      this.saveState();
    });
  }

  private updatePosition() {
    if (!this.container) return;
    this.container.style.bottom = `${this.pos.y}px`;
    this.container.style.right = `${this.pos.x}px`;
  }

  setPersistInfo(info: PersistOptions) {
    this.persistInfo = info;
  }

  private renderInitial() {
    if (!this.shadow) return;
    this.shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: ${this.pos.y}px;
          right: ${this.pos.x}px;
          width: 350px;
          max-height: 80vh;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          font-family: monospace;
          font-size: 12px;
          border-radius: 8px;
          overflow: hidden;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 1px solid #444;
          display: flex;
          flex-direction: column;
        }
        .header {
          padding: 8px 12px;
          background: #222;
          border-bottom: 1px solid #444;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
        }
        .content {
          padding: 8px;
          overflow-y: auto;
          display: ${this.isMinimized ? 'none' : 'block'};
        }
        .header-controls {
          display: flex;
          gap: 8px;
        }
        .btn-icon {
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          background: #444;
          border: none;
          color: white;
          font-size: 10px;
        }
        .btn-icon:hover {
          background: #666;
        }
        .rule {
          margin-bottom: 8px;
          padding: 6px;
          border-radius: 4px;
          background: #333;
        }
        .rule-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .rule-id {
          color: #aaa;
          font-size: 10px;
        }
        .rule-expr {
          word-break: break-all;
          color: #88ccff;
        }
        .status {
          font-weight: bold;
          padding: 2px 4px;
          border-radius: 2px;
          font-size: 10px;
        }
        .status-true { background: #228b22; }
        .status-false { background: #b22222; }
        .status-error { background: #ff4500; }
        .status-disabled { background: #666; color: #ccc; }
        .persist-badge {
          font-size: 9px;
          background: #444;
          padding: 1px 4px;
          border-radius: 4px;
          color: #00ff00;
          border: 1px solid #00ff00;
        }
        .header-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .effects {
          margin-top: 4px;
          padding-left: 12px;
          border-left: 2px solid #555;
          font-size: 11px;
        }
        .effect-item {
          margin-top: 2px;
        }
        .effect-skipped {
          color: #888;
          text-decoration: line-through;
        }
        .error-msg {
          color: #ff6347;
          font-size: 10px;
          margin-top: 4px;
        }
      </style>
      <div class="header">
        <div class="header-top">
          <span>FormFx Debug</span>
          ${this.persistInfo ? `<span class="persist-badge">PERSIST</span>` : ''}
        </div>
        <div class="header-controls">
          <button id="toggle-minimize" class="btn-icon">${this.isMinimized ? '□' : '_'} </button>
        </div>
      </div>
      <div id="rule-list" class="content">
        Waiting for evaluation...
      </div>
    `;
    this.setupDragging();
  }

  update(debugInfos: DebugInfo[]) {
    if (!this.shadow) return;
    const listEl = this.shadow.getElementById('rule-list');
    if (!listEl) return;

    listEl.innerHTML = debugInfos.map(info => {
      const { rule, result, error } = info;
      
      let statusClass = result === 'error' ? 'status-error' : (result ? 'status-true' : 'status-false');
      let statusText = result === 'error' ? 'ERROR' : result.toString().toUpperCase();

      if (rule.disabled) {
        statusClass = 'status-disabled';
        statusText = 'DISABLED';
      }
      
      let effectInfo = `${rule.type} ${this.getSelector(rule.element)}`;
      if (result !== true && result !== 'error' && !rule.disabled) {
        effectInfo = `<span class="effect-skipped">${effectInfo} (skipped)</span>`;
      }
      if (rule.disabled) {
        effectInfo = `<span class="effect-skipped">${effectInfo}</span>`;
      }

      return `
        <div class="rule">
          <div class="rule-header">
            <span class="rule-id">${rule.id || (rule.source === 'attribute' ? 'Attr' : 'JSON')}</span>
            <span class="status ${statusClass}">${statusText}</span>
          </div>
          <div class="rule-expr">${rule.expression}</div>
          <div class="effects">
            <div class="effect-item">${effectInfo}</div>
          </div>
          ${error ? `<div class="error-msg">Error: ${error}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  private getSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.className) return `.${el.className.split(' ').join('.')}`;
    return el.tagName.toLowerCase();
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}
