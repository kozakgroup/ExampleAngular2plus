import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { TranslatorService } from 'shared/services';

@Pipe({
  name: 'translate',
})
export class TranslationPipe implements PipeTransform {
  constructor(private translateService: TranslatorService) {}

  public transform(value: string, language?: string): Observable<string> {
    if (!value) { return Observable.of(''); }

    return this.translateService.translate(value, language)
      .switchMap((translation) => {
        if (translation) { return Observable.of(translation); }

        return Observable.of(value);
      });
  }
}
