import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Point } from 'math/point';
import Data from 'src/drawing/data';
import { RequireData } from 'src/drawing/decorators/data-bind';
import { NgHelperService } from 'src/services/ngcomps.service';
import { escape } from 'utils/strings';
import { parse, stringify } from 'utils/transform-parser';

@Component({
  selector: 'labelx',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.sass'],
})
export class LabelComponent {
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  @Input('font-size') fontSize = 14;
  @Input('line-space') lineSpace = 2;

  @Input('transfrom') transform = 'matrix(1,0,0,1,0,25)';
  @Input('title') title = '';

  @ViewChild('viewEl', { read: ElementRef })
  viewEl?: ElementRef<SVGGraphicsElement>;

  @ViewChild('editorEl', { read: ElementRef })
  editorEl?: ElementRef<HTMLElement>;

  isEditing = false;
  @RequireData(Data.editorMode, (t) => t)
  dblclick() {
    if (!this.viewEl) return;

    this.isEditing = !this.isEditing;

    const rect = this.viewEl.nativeElement.getBoundingClientRect();

    this.changeDetectorRef.detectChanges();
    if (this.editorEl) {
      NgHelperService.setStyles(this.renderer, this.editorEl, {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.left + rect.width / 2}px`,
        minWidth: `${rect.width}px`,
        fontSize: `${14 * Data.data.zoom}px`,
      });
      this.bindBlur(this.editorEl.nativeElement.parentElement!);
    }
  }

  private bindBlur(editor: HTMLElement) {
    window.document.body.appendChild(editor);

    editor.addEventListener('click', this.onBlur.bind(this));
  }

  private onBlur(e: MouseEvent) {
    if (e.target !== e.currentTarget) return;

    e.stopPropagation();
    e.preventDefault();
    this.isEditing = false;
    if (this.editionTemp.trim() !== '') {
      this.title = this.editionTemp;
    }
  }

  motionCallback(movement: Point) {
    const zoomedMovement = movement.div(Data.data.zoom);
    const older = parse(this.transform);
    const matrix = (older['matrix'] as number[]) || [1, 0, 0, 1, 0, 0];
    this.transform = stringify({
      matrix: [
        matrix[0],
        matrix[1],
        matrix[2],
        matrix[3],
        matrix[4] + zoomedMovement.x,
        matrix[5] + zoomedMovement.y,
      ],
    });
  }

  private editionTemp = '';
  ///may need this: https://stackoverflow.com/a/33064789/9883803
  inputHandle(e: Event) {
    const event = e as InputEvent;
    this.editionTemp = escape((event.target as any).innerHTML);
  }
}
