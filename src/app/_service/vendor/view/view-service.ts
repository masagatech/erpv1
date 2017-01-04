import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class VendorviewService {
    constructor(private _dataserver: DataService, private _router: Router) { }

     getvendor(req: any) {
        return this._dataserver.post("getvendor", req);
    }
}