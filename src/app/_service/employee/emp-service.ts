import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class EmpService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    viewEmployeeDetails(req: any) {
        return this._dataserver.post("GetEmployeeMaster", req)
    }

    saveEmployeeDetails(req: any) {
        return this._dataserver.post("SaveEmployeeDetails", req)
    }
}