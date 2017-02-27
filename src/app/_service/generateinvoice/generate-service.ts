import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class generateinvService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

    //Get Document No
    getInvdocumentNo(req:any)
    {
        return this._dataserver.post("getdocumentno",req);
    }
    
    getInvDetails(req:any)
    {
        return this._dataserver.post("GetInvoiceDetails",req);
    }
    GenerateInvoice(req:any)
    {
         return this._dataserver.post("Invoice_Save",req);
    }
}
