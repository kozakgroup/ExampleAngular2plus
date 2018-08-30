import { Directive, ElementRef, Input, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { TranslatorService } from 'shared/services';

@Directive({
  selector: '[appTranslate]',
})
export class TranslatorDirective implements AfterViewInit, OnDestroy {
  @Input() public appTranslate: string;
  @Input() public loader = false;

  public subscription: Subscription;

  constructor(private elementRef: ElementRef, private translateService: TranslatorService, private renderer: Renderer2) {}

  public ngAfterViewInit() {
    const innerHTML = this.elementRef.nativeElement.innerHTML;

    if (this.loader) {
      this.renderer.setProperty(
        this.elementRef.nativeElement,
        'innerHTML',
        '<div class="spin-wrapper"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i></div>'
      );
    }

    this.subscription = this.translateService.translate(innerHTML, this.appTranslate)
      .subscribe((translation) => {
        if (translation) { return this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', translation); }

        this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', innerHTML);
      });
  }

  public ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }
}
