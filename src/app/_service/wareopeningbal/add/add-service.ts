import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class WarAddOpbal {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getopeningstock(req: any) {
        return this._dataserver.post("getopeningstock", req);
    }
    saveopeningstock(req: any) {
        return this._dataserver.post("saveWareOpeningStock", req);
    }
}