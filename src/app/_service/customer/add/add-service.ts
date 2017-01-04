import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class CustomerAddService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    saveCustomer(req: any) {
        return this._dataserver.post("saveCustomer", req);
    }

    getCustomerdrop(req: any) {
        return this._dataserver.post("getcustomerdrop", req);
    }

    getcustomer(req: any) {
        return this._dataserver.post("getcustomer", req);
    }

    getctrldetail(req: any) {
        return this._dataserver.post("getctrldetails", req);
    }
}