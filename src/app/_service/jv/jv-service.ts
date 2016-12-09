import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class JVService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    viewJVDetails(req: any) {
        return this._dataserver.post("GetJVMaster", req)
    }

    saveJVDetails(req: any) {
        return this._dataserver.post("SaveJVDetails", req)
    }
}