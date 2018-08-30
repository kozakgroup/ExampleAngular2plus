import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

@Pipe({
  name: 'dateHumanize',
})
export class DateHumanizePipe implements PipeTransform {

  public transform(value: any, args?: any): any {
    let humanizeValue = moment.duration(value, args).humanize().replace('a', '');

    if (humanizeValue === '3 months') {
      humanizeValue = 'quarter';
    }

    return humanizeValue;
  }
}
