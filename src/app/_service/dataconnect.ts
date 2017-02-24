import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Globals } from '../../app/_const/globals';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Rx';
declare var $: any;

@Injectable()
export class DataService {

    global = new Globals();

    constructor(private _http: Http) { }

    post(api: string, params: any) {
        let body = JSON.stringify(params);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers, method: "post" });
        return this._http.post(this.global.serviceurl + api, body, options)
            .map(res => res.json())
            .catch(this.handleError);

    }

    get(api: string, params: any) {
        return this._http.get(this.global.serviceurl + api + "?" + $.param(params))
            .toPromise()
            .then(res => <any[]>res.json().data)
            .then(data => { return data; });

    }


    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || ' error');
    }

}