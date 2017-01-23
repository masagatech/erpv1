import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class TranspoterViewService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getTranspoter(req: any) {
        return this._dataserver.post("getTranspoter", req);
    }
}