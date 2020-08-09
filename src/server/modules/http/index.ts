import { Injectable } from '../inject';
const got = require('got');
const { CookieJar } = require('tough-cookie');
const fs = require('fs');

@Injectable
export class Http {
  private _cookieJar;
  constructor() {
    this._cookieJar = new CookieJar();
  }

  public async get(url: string, headers?: { [header: string]: string }): Promise<string> {
    return got(url, {
      timeout: 1000 * 30,
      retry: 3,
      cookieJar: this._cookieJar,
      ...(headers ? { headers } : {}),
    }).then((response) => response.body);
  }

  public async post(url: string, form: { [key: string]: string }): Promise<string> {
    return got
      .post(url, {
        timeout: 1000 * 30,
        retry: 3,
        cookieJar: this._cookieJar,
        form,
        followRedirect: false,
      })
      .then((response) => response.body);
  }

  public async download(url: string, file: string): Promise<void> {
    const stream = got.stream(url);
    return new Promise((resolve) => {
      const writeStream = fs.createWriteStream(file);
      stream.pipe(writeStream);
      writeStream.on('finish', () => {
        resolve();
      });
    });
  }
}
