import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class AttachService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getAttach(req: any) {
        return this._dataserver.post("getAttach", req)
    }

    saveAttach(req: any) {
        return this._dataserver.post("saveAttach", req)
    }
}