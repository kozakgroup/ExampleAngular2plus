import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCopy]'
})
export class CopyDirective {

  @Input() appCopy: any;

  constructor() { }

  @HostListener('click') onClick() {
    this.appCopy.select();
    document.execCommand('copy');
    window.getSelection().removeAllRanges()
  }

}
