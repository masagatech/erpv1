import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class dcmasterService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

    getdropdwn(req:any)
    {
         return this._dataserver.post("GetCustomerSalesAdr",req);        
    }
    getAutoCompleted(req:any)
    {
        return this._dataserver.post("GetCustomerAuto",req);
    }

}