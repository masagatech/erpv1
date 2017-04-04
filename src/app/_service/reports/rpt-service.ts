import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ReportsService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getBankView(req: any) {
        return this._dataserver.post("getBankView", req)
    }

    getBankBook(req: any) {
        return this._dataserver.post("getBankBook", req);
    }

    getBankDashboard(req: any) {
        return this._dataserver.post("getBankDashboard", req);
    }

    getLedger(req: any) {
        return this._dataserver.post("getLedger", req);
    }

    getProfitNLoss(req: any) {
        return this._dataserver.post("getProfitNLoss", req);
    }

    getBalanceSheet(req: any) {
        return this._dataserver.post("getBalanceSheet", req);
    }

    getTrialBalance(req: any) {
        return this._dataserver.post("getTrialBalance", req);
    }

    getDebtorsRpt(req: any) {
        return this._dataserver.post("getDebtorsRpt", req);
    }

    getJVReport(req: any) {
        return this._dataserver.post("getJVReport", req);
    }
}