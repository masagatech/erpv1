import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class dcmasterService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getdcdetails(req: any) {
        return this._dataserver.post("salesorderdetails", req);
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

     GetSalesOrderView(req: any) {
        return this._dataserver.post("getSalesOrderView", req);
    }

    deleteDcMaster(req: any) {
        return this._dataserver.post("DeleteDCMaster", req);
    }

}