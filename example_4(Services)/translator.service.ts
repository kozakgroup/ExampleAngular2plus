import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { chunk } from 'lodash';

import { SUPPORT_LANGUAGES } from 'shared/constants';

import { environment } from 'environment';

@Injectable()
export class TranslatorService {
  public articleSubject: Subject<string> = new Subject();
  public languageSubject: Subject<string> = new Subject();

  private language: string;
  private phrases: any[] = [];
  private articleText: string;

  constructor(private http: HttpClient) {}

  public supportedLanguages(): Observable<any[]> {
    const params = new HttpParams()
      .set('key', environment.api.google_translate_api.apiKey)
      .set('target', localStorage.getItem('app-language') || 'en');

    return this.http.get(`${environment.api.google_translate_api.host}/languages`, { params })
      .map((response: any) => response.data.languages.filter((item: any) => SUPPORT_LANGUAGES.includes(item.language)));
  }

  public translate(phrase_in: string, language?: string): Observable<string> {
    if (language) { return this.instantTranslation(phrase_in, language); }

    const item = this.phrases.find(({ phrase }) => phrase === phrase_in);

    if (item) { return item.subscriber.asObservable(); }

    return this.appendPhrase(phrase_in);
  }

  public changeLanguage(language: string): Observable<boolean> {
    this.language = language;
    this.languageSubject.next(this.language);

    if (this.language === 'en') {
      localStorage.removeItem('app-language');
      this.phrases.forEach(item => item.subscriber.next(item.phrase));
      this.articleSubject.next(this.articleText);

      return Observable.of(true);
    }

    localStorage.setItem('app-language', language);

    if (this.articleText) {
      this.translateArticle(this.articleText, this.language)
        .subscribe(translatedText => this.articleSubject.next(translatedText));
    }

    const phrasesChunks = chunk(this.phrases.map(item => item.phrase), 128);
    const observables = [];

    let base = 0;
    phrasesChunks.forEach((phrasesChunk: string[]) => {
      observables.push(this.translateChunk(phrasesChunk, base));

      base += phrasesChunk.length;
    });

    if (!observables.length) { return Observable.of(true); }

    return Observable.forkJoin(observables)
      .switchMap(() => Observable.of(true));
  }

  public translateArticle(articleText: string, language?: string): Observable<string> {
    this.articleText = articleText;

    const currentLanguage = language || this.language;

    if (!currentLanguage || currentLanguage === 'en') { return Observable.of(articleText); }

    return this.googleTranslate(articleText)
      .map((response: any) => response.data.translations[0].translatedText);
  }

  private instantTranslation(phrase_in: string, language: string): Observable<any> {
    return this.googleTranslate([phrase_in], language)
      .switchMap((response: any) => Observable.of(response.data.translations[0].translatedText));
  }

  private appendPhrase(phrase_in: string): Observable<any> {
    const item = { phrase: phrase_in, subscriber: new BehaviorSubject(phrase_in) };

    this.phrases.push(item);
    this.googleTranslate([phrase_in])
      .subscribe((response: any) => {
        item.subscriber.next(response.data.translations[0].translatedText);
      });

    return item.subscriber.asObservable();
  }

  private translateChunk(phrases: string[], indexBase: number) {
    return this.googleTranslate(phrases)
      .switchMap((response: any) => {
        response.data.translations.forEach(({ translatedText }: any, i: number) => {
          this.phrases[indexBase + i].subscriber.next(translatedText);
        });

        return Observable.of(true);
      });
  }

  private googleTranslate(phrases: string[] | string, language?: string): Observable<any> {
    const target = language || this.language;

    if (!target || target === 'en') {
      if (Array.isArray(phrases)) {
        return Observable.of({ data: { translations: phrases.map(phrase => ({ translatedText: phrase })) } });
      }

      return Observable.of({ data: { translations: [{ translatedText: phrases }] } });
    }

    const params = new HttpParams().set('key', environment.api.google_translate_api.apiKey).set('source', 'en');

    const body = { target, q: phrases };

    return this.http.post(environment.api.google_translate_api.host, body, { params });
  }
}
