import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import Data from 'src/drawing/data';
import { Action, ActionAction } from 'src/drawing/data/actions';

@Component({
  selector: 'actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.sass'],
})
export class ActionsComponent {
  constructor(
    private resolver: ComponentFactoryResolver,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @ViewChild('mainHolder', { read: ViewContainerRef, static: false })
  mainHolder: ViewContainerRef | null = null;

  @ViewChild('footerHolder', { read: ViewContainerRef, static: false })
  footerHolder: ViewContainerRef | null = null;

  compRefs: ComponentRef<any>[] | null = null;

  actions = Data.actions;

  private _activedAction: Omit<Action, 'type' | 'src'> | null = null;
  set activedAction(aA: Action | null) {
    this._activedAction = aA;
    switch (aA?.type) {
      case 'click':
        Data.action.next(-1);
        break;
      case 'action':
        /// https://stackoverflow.com/a/46043837/9883803
        this.changeDetectorRef.detectChanges();
        this.removeContent();
        this.setContent(aA);
        break;
      default:
        //only none casecate there
        Data.action.next(-1);
    }
  }
  get activedAction() {
    return this._activedAction as any;
  }

  get actived() {
    return Data.data.action;
  }

  private setContent(action: ActionAction) {
    if (!this.mainHolder || !this.footerHolder) {
      console.error('no holder found');
      return;
    }
    const { main, footer } = action.compoennts;
    let compRef = [];

    compRef.push(
      this.mainHolder.createComponent(
        this.resolver.resolveComponentFactory(main)
      )
    );
    if (footer)
      compRef.push(
        this.footerHolder.createComponent(
          this.resolver.resolveComponentFactory(footer)
        )
      );

    this.compRefs = compRef;
  }

  private removeContent() {
    this.compRefs?.forEach((item) => item.destroy());
    this.compRefs = null;
  }

  onSelect(_: MouseEvent, idx: number) {
    if (this.actived === idx || idx < 0) {
      this.activedAction = null;
    } else {
      Data.action.next(idx);
      this.activedAction = this.actions[idx];
    }
  }
}
