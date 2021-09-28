import { AdjunctionComponent } from 'src/drawing/comps/adjunction/adjunction.component';
import { SettingsComponent } from 'src/drawing/comps/settings/settings.component';
import { ArrayElement, ArrayRecord } from 'src/gobal';

type Types = ['click', 'action'];
type TypeRecord = ArrayRecord<Types, 'all'>;

interface ActionBase<T extends ArrayElement<Types>> {
  src: `assets/action/${string}`;
  alt: string;
  type: T;
}
export interface ActionAction extends ActionBase<TypeRecord['action']> {
  compoennts: {
    main: new (...props: any) => void;
    footer?: new (...props: any) => void;
  };
}
export interface ClickAction extends ActionBase<TypeRecord['click']> {
  onClick: (e: MouseEvent) => void;
}

export type Action = ActionAction | ClickAction;

export const actions: readonly Action[] = [
  {
    src: 'assets/action/add.svg',
    alt: 'add',
    type: 'action',
    compoennts: {
      main: AdjunctionComponent,
    },
  },
  {
    src: 'assets/action/settings.svg',
    alt: 'settings',
    type: 'action',
    compoennts: {
      main: SettingsComponent,
    },
  },
  {
    src: 'assets/action/focus.svg',
    alt: 'focus',
    type: 'click',
    onClick: (e) => {},
  },
];
