import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class pendingdcService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

    getPendingDocumentNo(req:any)
    {
        return this._dataserver.post("PendingDC_Get",req);
    }
    getPendignDcDetails(req:any)
    {
        return this._dataserver.post("GetDcDetails",req);
    }
    ConfirmDC(req:any)
    {
        return this._dataserver.post("DCConfirm_Save",req);
    }
}