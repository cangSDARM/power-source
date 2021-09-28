export enum MouseButtons {
  Left = 0,
  Middle = 1,
  Right = 2,
  Back = 3,
  Forward = 4,
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType[number];

type Indexable = string | number | symbol;

type ArrayRecordAll<T extends readonly unknown[]> = T[number] extends Indexable
  ? { [key in T[number]]: key }
  : never;

type ArrayRecordPick<T extends readonly unknown[]> = {
  [key in Extract<T[number], Indexable>]: key;
};

export type ArrayRecord<
  T extends 'req' extends K ? readonly Indexable[] : readonly unknown[],
  K extends 'pick' | 'all' | 'req'
> = 'pick' extends K ? ArrayRecordPick<T> : ArrayRecordAll<T>;
