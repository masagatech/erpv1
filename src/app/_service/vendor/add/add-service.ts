import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class VendorAddService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    saveVendor(req: any) {
        return this._dataserver.post("saveVendor", req);
    }

    getVendordrop(req: any) {
        return this._dataserver.post("getvendordrop", req);
    }

    getvendor(req: any) {
        return this._dataserver.post("getvendor", req);
    }
}