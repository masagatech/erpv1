import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class pendingdcService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

    getPendingOrdNo(req:any)
    {
        return this._dataserver.post("getPendingDocumentNo",req);
    }
    getPendignDcDetails(req:any)
    {
        return this._dataserver.post("getPendingOrderDetails",req);
    }
    ConfirmDC(req:any)
    {
        return this._dataserver.post("DCConfirm_Save",req);
    }
}