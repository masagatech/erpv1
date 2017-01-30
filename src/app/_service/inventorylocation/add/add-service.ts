import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class InvAddService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getlocation(req: any) {
        return this._dataserver.post("Inventoryloc", req);
    }

    savelocation(req: any) {
        return this._dataserver.post("saveLocation", req);
    }
}