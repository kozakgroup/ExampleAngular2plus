import {Directive, ElementRef, HostListener, Input, Renderer2, OnInit} from '@angular/core';
import * as _ from "lodash";

@Directive({
  selector: '[popover]'
})
export class PopoverDirective implements OnInit {
  private toggle: Element;
  private arrow: Element;
  private eventListen: any;
  readonly defaultPopoverWidth: number = 200;
  readonly defaultPopoverPadding: number = 10;
  readonly defaultPopoverEventType: string = 'hover';
  readonly defaultPopoverPosition: number = 50;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  @Input() popover;

  @Input() popoverWidth;

  @Input() popoverPadding;

  @Input() popoverEventType;

  @Input() popoverPosition;

  ngOnInit() {
    this.setDefaultOptions();
    this.setToogle();
  }

  private setDefaultOptions(){
    if(!this.popoverWidth){
      this.popoverWidth = this.defaultPopoverWidth;
    }
    if(!this.popoverPadding){
      this.popoverPadding = this.defaultPopoverPadding;
    }
    if(!this.popoverEventType){
      this.popoverEventType = this.defaultPopoverEventType;
    }
    if(!this.popoverPosition){
      this.popoverPosition = this.defaultPopoverPosition;
    }
  }

  private setToogle(){
    this.toggle = document.querySelector(`div[popover-toggle="${this.popover}"]`);
    if (this.toggle) {
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
      this.renderer.setStyle(this.toggle, 'display', 'none');
    }
  }

  listenerOuterClick(ev) {
    let popoverTarget = _.get(ev, 'target.attributes.ng-reflect-popover.value');
    let toggleTarget = _.get(ev, 'target.attributes.popover-toggle.value');
    let isInSide = this.toggle.contains(ev.target);
    if (toggleTarget !== this.popover && popoverTarget !== this.popover && !isInSide || this.popoverEventType !=='click') {
        this.renderer.removeChild(this.toggle,this.arrow);
        this.renderer.setStyle(this.toggle, 'display', 'none');
        this.renderer.removeStyle(this.toggle, 'left');
        this.renderer.removeStyle(this.toggle, 'top');
        this.renderer.removeAttribute(this.toggle, 'toggle');
        this.eventListen();
    }
  }

  listenerInnerClick(){
    this.renderer.removeChild(this.toggle,this.arrow);
    this.renderer.setStyle(this.toggle, 'display', 'none');
    this.renderer.removeStyle(this.toggle, 'left');
    this.renderer.removeStyle(this.toggle, 'top');
    this.renderer.removeAttribute(this.toggle, 'toggle');
  }

  openPopover() {
    this.renderer.setStyle(this.toggle, 'width', this.popoverWidth+'px');
    this.renderer.setStyle(this.toggle, 'display', 'block');
    this.renderer.setStyle(this.toggle, 'padding', this.popoverPadding+'px');
    this.renderer.setStyle(this.toggle, 'position', 'absolute');
    let elemWidth = this.el.nativeElement.getBoundingClientRect()['width'];
    let toggleWidth = this.toggle.getBoundingClientRect()['width'];
    let elemHeight = this.el.nativeElement.getBoundingClientRect()['height'];
    let elemTop = this.el.nativeElement.getBoundingClientRect()['top'];
    let elemLeft = this.el.nativeElement.getBoundingClientRect()['left'];
    let elemOffsetTop = this.el.nativeElement['offsetTop'];
    let closesElements = this.toggle.querySelectorAll('[close-popover]');
    if(closesElements){
      _.forEach(closesElements,(el)=>{
        el.addEventListener('click',this.listenerInnerClick.bind(this));
      })
    }
    let deflection = this.popoverPosition-50;
    let newToggleLeft = elemWidth >= toggleWidth ? (elemLeft + ((elemWidth - toggleWidth) / 2)) : (elemLeft + ((elemWidth - toggleWidth)/ 2)-(toggleWidth/100*deflection)+4);
    this.renderer.setStyle(this.toggle, 'left', newToggleLeft + 'px');
    this.renderer.setStyle(this.toggle, 'top', (elemOffsetTop + elemHeight + 15) + 'px');
    this.arrow = this.renderer.createElement('div');
    this.arrow.innerHTML = '&#9650;';
    this.renderer.setStyle(this.arrow,'position','absolute');
    this.renderer.setStyle(this.arrow,'top','-30px');
    this.renderer.setStyle(this.arrow,'font-size','30px');
    this.renderer.setStyle(this.arrow,'left',((toggleWidth-this.popoverPadding)/100*this.popoverPosition-15)+'px');
    this.renderer.addClass(this.arrow,'arrow');
    this.renderer.appendChild(this.toggle,this.arrow);
  }

  @HostListener('mouseenter',['$event']) openToHover() {
    if(this.popoverEventType !== 'hover'||this.toggle['style']['display']!=='none'){
      return;
    }
    this.openPopover();
    this.eventListen = this.renderer.listen(this.el.nativeElement, 'mouseleave', this.listenerOuterClick.bind(this));
  }

  @HostListener('click', ['$event']) openToClick() {
    if(this.popoverEventType !== 'click'||this.toggle['style']['display']!=='none'){
      return;
    }
    this.openPopover();
    this.eventListen = this.renderer.listen(document, 'click', this.listenerOuterClick.bind(this));
  }
}
