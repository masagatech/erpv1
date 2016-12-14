import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class EmpService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getEmployee(req: any) {
        return this._dataserver.post("getEmployee", req)
    }

    saveEmployee(req: any) {
        return this._dataserver.post("saveEmployee", req)
    }
}