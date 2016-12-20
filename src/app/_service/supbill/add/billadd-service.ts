import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class BilladdService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

    PurchaseInvoiceSave(req:any)
    {
        return this._dataserver.post("PurchaseInvoiceSave",req);
    }
     EditBill(req:any)
    {
        return this._dataserver.post("GetPurchaseInvoice",req);
    }
    getItemsRate(req:any)
    {
        return this._dataserver.post("GetItemsRate",req);

    }
    }