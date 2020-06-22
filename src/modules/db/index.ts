import { Injectable } from '../inject';

const Lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

try {
  require('fs').mkdirSync('data');
} catch {}

@Injectable
export class DB {
  private _db: any;

  constructor(file: string = 'data/db.json') {
    this._db = new Lowdb(new FileSync(file));
  }

  public set(path: string, value: any): void {
    this._db.set(path, value).write();
  }

  public unset(path: string): void {
    (<any>this._db).unset(path).write();
  }

  public updateOrPush(path: string, value: any, find: { [key: string]: any }): void {
    if (this._db.get(path).find(find).value()) {
      this._db.get(path).find(find).assign(value).write();
    } else {
      this.push('torrent.series', value);
    }
  }

  public push(path: string, value: any): void {
    this._db.get(path).push(value).write();
  }

  public find(path: string, find: { [key: string]: string }): any {
    return this._db.get(path).find(find).value();
  }

  public get(path: string): any {
    return this._db.get(path).value();
  }

  public has(path: string): boolean {
    return this._db.has(path).value();
  }

  public defaults(value: any): void {
    this._db.defaults(value).write();
  }
}
