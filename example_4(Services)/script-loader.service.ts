import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class ScriptLoaderService {
  private _renderer2: Renderer2;
  public loadSubject: ReplaySubject<boolean> = new ReplaySubject();

  constructor(private rendererFactory: RendererFactory2) {
    this._renderer2 = this.rendererFactory.createRenderer(null, null);
    this.initScript();
  }

  public widgetLoad() {
    return this.loadSubject.asObservable();
  }

  private initScript(): void {
    const script = this._renderer2.createElement('script');
    this._renderer2.setAttribute(script, 'type', 'text/javascript');
    this._renderer2.setAttribute(script, 'src', 'https://example');
    this._renderer2.appendChild(document.body, script);
    this._renderer2.listen(script, 'load', this.emitLoad.bind(this));
  }

  private emitLoad() {
    this.loadSubject.next(true);
  }
}
