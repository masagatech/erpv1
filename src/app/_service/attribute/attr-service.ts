import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class attributeService {
    constructor(private _dataserver: DataService, private _router: Router) {

    }
    attsave(req: any) {
        return this._dataserver.post("saveAttribute", req);
    }

    attget(req: any) {
        return this._dataserver.post("getAttribute", req);
    }
}