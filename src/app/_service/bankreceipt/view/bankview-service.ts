import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class bankreceiptViewService {
    constructor(private _dataserver: DataService, private _router: Router) {

    }
     getBankMaster(req: any) {
        return this._dataserver.post("getBankMaster", req);
    }
   
    getBankRecieptView(req: any) {
        return this._dataserver.post("getbankreciptview", req);
    }
}