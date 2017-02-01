import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class InvViewService {
    constructor(private _dataserver: DataService, private _router: Router) { }
    getinvlocation(req: any) {
        return this._dataserver.post("getInventoryloc", req);
    }
}