import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class PurchaseaddService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

    SaveOP(req:any)
    {
        return this._dataserver.post("savePurchaseOrder",req);
    }
    EditPO(req:any)
    {
        return this._dataserver.post("SupplierDetails",req);
    }
    getitemsDetails(req:any)
    {
        return this._dataserver.post("getitemsDetails",req);
    }
    }
