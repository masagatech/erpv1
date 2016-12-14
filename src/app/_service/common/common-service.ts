import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class CommonService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getAutoData(req: any) {
        return this._dataserver.post("getAutoData", req)
    }

    getMOM(req: any) {
        return this._dataserver.post("getMOM", req)
    }
}