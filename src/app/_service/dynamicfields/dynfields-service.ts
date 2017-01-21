import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class DynamicFieldsService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    // Dynamic Fields

    getDynamicFields(req: any) {
        return this._dataserver.post("getDynamicFields", req)
    }

    saveDynamicFields(req: any) {
        return this._dataserver.post("saveDynamicFields", req)
    }
}