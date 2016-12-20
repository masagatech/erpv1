import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class BillviewService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

    getBillDetails(req:any)
    {
        return this._dataserver.post("GetPurchaseInvoice",req);
    }
    }