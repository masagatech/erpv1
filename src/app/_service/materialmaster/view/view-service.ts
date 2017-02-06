import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class materialViewService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getMaterialMaster(req: any) {
        return this._dataserver.post("getmaterialMaster", req);
    }
}