import { Pipe, PipeTransform } from '@angular/core';
import { padStart } from 'lodash';
import * as moment from 'moment';

@Pipe({
  name: 'timeScore',
})
export class TimeScorePipe implements PipeTransform {

  public transform(value: number): string {
    const absoluteValue = Math.abs(value);
    const duration = moment.duration(absoluteValue, 'milliseconds');

    return `${padStart(duration.minutes().toString(), 2, '0')}:`
      + `${padStart(duration.seconds().toString(), 2, '0')}:`
      + `${padStart(duration.milliseconds().toString(), 3, '0')}`;
  }
}
