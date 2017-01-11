import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class dcmasterService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getdropdwn(req: any) {
        return this._dataserver.post("getdcdropdetails", req);
    }
    getAutoCompleted(req: any) {
        return this._dataserver.post("GetCustomerAuto", req);
    }

    getItemsAutoCompleted(req: any) {
        return this._dataserver.post("getdcitemsdetails", req);
    }

    saveDcMaster(req: any) {
        return this._dataserver.post("saveDcMaster", req);
    }

    getDcmasterView(req: any) {
        return this._dataserver.post("getdcdetails", req);
    }

    deleteDcMaster(req: any) {
        return this._dataserver.post("DeleteDCMaster", req);
    }

}