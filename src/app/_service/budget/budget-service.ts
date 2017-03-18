import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class BudgetService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    // Initiate

    getInitiate(req: any) {
        return this._dataserver.post("getInitiate", req)
    }

    saveInitiate(req: any) {
        return this._dataserver.post("saveInitiate", req)
    }

    // Committee

    getCommittee(req: any) {
        return this._dataserver.post("getCommittee", req)
    }

    saveCommittee(req: any) {
        return this._dataserver.post("saveCommittee", req)
    }

    // Ownership

    getEnvelope(req: any) {
        return this._dataserver.post("getEnvelope", req)
    }

    saveEnvelope(req: any) {
        return this._dataserver.post("saveEnvelope", req)
    }

    // Ownership

    getOwnership(req: any) {
        return this._dataserver.post("getOwnership", req)
    }

    saveOwnership(req: any) {
        return this._dataserver.post("saveOwnership", req)
    }

    // Start Forecasting
    
    getMonthDetails(req: any) {
        return this._dataserver.post("getMonthDetails", req)
    }

    viewStartForeCasting(req: any) {
        return this._dataserver.post("viewStartForeCasting", req)
    }

    getExpenseBudget(req: any) {
        return this._dataserver.post("getStartForeCasting", req)
    }

    saveExpenseBudget(req: any) {
        return this._dataserver.post("saveStartForeCasting", req)
    }
}