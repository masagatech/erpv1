"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var dataconnect_1 = require('../../../_service/dataconnect');
var router_1 = require('@angular/router');
var bankreceiptViewService = (function () {
    function bankreceiptViewService(_dataserver, _router) {
        this._dataserver = _dataserver;
        this._router = _router;
    }
    bankreceiptViewService.prototype.getBankMaster = function (req) {
        return this._dataserver.post("BankNameGet", req);
    };
    bankreceiptViewService.prototype.getBankRecieptView = function (req) {
        return this._dataserver.post("BankReceiptView", req);
    };
    bankreceiptViewService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [dataconnect_1.DataService, router_1.Router])
    ], bankreceiptViewService);
    return bankreceiptViewService;
}());
exports.bankreceiptViewService = bankreceiptViewService;
//# sourceMappingURL=bankview-service.js.map