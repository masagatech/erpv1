import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class SupplierDetailsService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

    getSupplierDetails(req:any)
    {
        return this._dataserver.post("SupplierDetails",req);
    }

    }
