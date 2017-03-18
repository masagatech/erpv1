import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class grnInwordService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getgrninworddetal(req: any) {
        return this._dataserver.post("getgrninworddetails", req);
    }

    savegrninword(req: any) {
        return this._dataserver.post("savegrninword", req);
    }

}