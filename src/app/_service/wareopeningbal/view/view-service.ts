import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class WarViewOpbal {
    constructor(private _dataserver: DataService, private _router: Router) { }
    getopeningstock(req: any) {
        return this._dataserver.post("getopeningstock", req);
    }
}