import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class TranspoterAddService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    saveTranspoter(req: any) {
        return this._dataserver.post("saveTranspoter", req);
    }

}