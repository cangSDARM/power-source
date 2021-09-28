import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isUndef } from 'utils/type-assert';

interface MenuItem {
  label: string;
  onClick: (e: MouseEvent) => void;
}

@Component({
  selector: 'context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.sass'],
})
export class ContextMenuComponent implements OnInit {
  private _items: MenuItem[] = [];

  set items(v: MenuItem[]) {
    this._items = v;
  }
  get items() {
    return this._items;
  }

  @Input()
  display = false;
  @Output()
  displayChange = new EventEmitter<boolean>();

  @Input('style')
  style = '';

  ngOnInit() {
    this.items = [
      {
        label: 'Copy',
        onClick: () => this.toggleDisplay(),
      },
      {
        label: 'Check',
        onClick: () => this.toggleDisplay(),
      },
    ];
  }

  toggleDisplay(active?: boolean) {
    this.display = isUndef(active) ? !this.display : !!active;
    this.displayChange.emit(this.display);
  }
}
