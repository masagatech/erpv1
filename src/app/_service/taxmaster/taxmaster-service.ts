import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class taxMasterService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    saveTaxMaster(req: any) {
        return this._dataserver.post("saveTaxMaster", req);
    }

  

}
