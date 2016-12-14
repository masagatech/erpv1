import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class FYService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getfy(req: any) {
        return this._dataserver.post("getfy", req)
    }

    savefy(req: any) {
        return this._dataserver.post("savefy", req)
    }
}