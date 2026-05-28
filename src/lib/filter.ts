import { Filter } from 'bad-words';

const filter = new Filter();

export function isProfane(text: string): boolean {
  return filter.isProfane(text);
}

export function cleanText(text: string): string {
  return filter.clean(text);
}
