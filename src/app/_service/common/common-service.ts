import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class CommonService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getAutoData(req: any) {
        return this._dataserver.post("getAutoData", req)
    }

    getAutoDataGET(req: any) {
        return this._dataserver.get("getAutoDataGET", req)
    }

    checkValidate(req: any) {
        return this._dataserver.post("checkValidate", req)
    }

    getMOM(req: any) {
        return this._dataserver.post("getMOM", req)
    }

    getMOMGrid(req: any) {
        return this._dataserver.post("getMOMGrid", req)
    }

    saveMOM(req: any) {
        return this._dataserver.post("saveMOM", req)
    }

    getOtherDetails(req: any) {
        return this._dataserver.post("getOtherDetails", req)
    }
    getisproceed(req: any) {
        return this._dataserver.post("getisproceed", req)
    }
}