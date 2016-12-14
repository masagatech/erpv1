import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for FY */
import { CompService } from '../../../../_service/company/comp-service' /* add reference for company */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for FY */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'addfy.comp.html',
    providers: [FYService, CompService, CommonService]
})

export class AddFY implements OnInit, OnDestroy {
    title: any;
    validSuccess: Boolean = true;

    FYID: number = 0;
    FromDate: any = "";
    ToDate: any = "";

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    CompanyDetails: any = [];
    YearDT: any = [];
    viewFYDT: any = [];

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _fyservice: FYService, private _compservice: CompService, private _commonservice: CommonService, ) {
        this.getMOM();
        this.getCompanyDetails();
    }

    getMOM() {
        this._commonservice.getMOM({ "MasterType": "FinancialYear" }).subscribe(data => {
            this.YearDT = JSON.parse(data.data);
            this.FromDate = this.YearDT[0].ID;
            this.ToDate = this.YearDT[0].ID;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    getCompanyDetails() {
        this._compservice.viewCompanyDetails({ "CompanyID": "0", "SearchTxt": "" }).subscribe(data => {
            this.CompanyDetails = JSON.parse(data.data);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    isValidSuccess() {
        if (this.FromDate == "") {
            alert("Enter From Year !!!!");
            return false;
        }
        if (this.ToDate == "") {
            alert("Enter To Year !!!!");
            return false;
        }

        return true;
    }

    getFYDetailsById(FYId: number) {
        this._fyservice.getFinancialYear({ "FYID": FYId, "FilterType": "Details" }).subscribe(data => {
            this.viewFYDT = JSON.parse(data.data);
            console.log(this.viewFYDT);

            this.FYID = this.viewFYDT[0].FYID;
            this.FromDate = this.viewFYDT[0].FromDate;
            this.ToDate = this.viewFYDT[0].ToDate;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveFYDetails() {
        this.validSuccess = this.isValidSuccess();
        console.log(this.validSuccess);
        var companyitem = null;

        debugger;

        var saveFY = {
            "FYID": this.FYID,
            "FromDate": this.FromDate,
            "ToDate": this.ToDate,
            "CreatedBy": "Vivek",
            "UpdatedBy": "Vivek"
        }

        if (this.validSuccess) {
            this._fyservice.saveFinancialYear(saveFY).subscribe(data => {
                var dataResult = JSON.parse(data.data);
                console.log(dataResult);

                if (dataResult[0].FYID !== "-1") {
                    alert(dataResult[0].Status);

                    var companyid = "";
                    var fyrights = "<fy>";

                    for (var i = 0; i <= this.CompanyDetails.length - 1; i++) {
                        companyitem = null;
                        companyitem = this.CompanyDetails[i];

                        if (companyitem !== null) {

                            $("#C" + companyitem.CompanyID).find("input[type=checkbox]").each(function () {
                                companyid += (this.checked ? $(this).val() + "," : "");
                            });
                        }
                    }

                    fyrights += "<id>" + dataResult[0].FYID + "</id>";
                    fyrights = "</fy>";

                    this.updateCompanyFYMapping(companyid, fyrights);

                    this._router.navigate(['/setting/financialyear']);
                }
                else {
                    alert("Error");
                }
            }, err => {
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    updateCompanyFYMapping(strCompID, fyRights) {
        this._compservice.updateCompanyFYMapping({ "strCompID": strCompID, "FYRights": fyRights }).subscribe(data => {
            var dataResult2 = JSON.parse(data.data);

            if (dataResult2[0].FYID !== "-1") {
            }
            else {
                alert("Error");
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    updateCompanyFYMappingOld(FYID) {
        var CompanyFYMap = "<r>";
        var GiveRights = "";

        for (var i = 0; i <= this.CompanyDetails.length - 1; i++) {
            debugger;
            var company = this.CompanyDetails[i];

            if (company !== null) {
                GiveRights = "";

                if (company.IsCompanyCheck == true) {
                    GiveRights += FYID;
                }
            }

            CompanyFYMap += "<i>";
            CompanyFYMap += "<CompanyID>" + company.CompanyID + "</CompanyID>";
            CompanyFYMap += "<FYRights>" + GiveRights + "</FYRights>";
            CompanyFYMap += "</i>";
        }

        CompanyFYMap += "</r>";

        console.log(CompanyFYMap);

        this._compservice.updateCompanyFYMapping({ "CompanyFYMap": CompanyFYMap }).subscribe(data => {
            var dataResult2 = JSON.parse(data.data);

            if (dataResult2[0].FYID !== "-1") {
            }
            else {
                alert("Error");
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveFYDetails();
        } else if (evt === "edit") {
            $('select').removeAttr('disabled');

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['FYID'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.FYID = params['FYID'];
                this.getFYDetailsById(this.FYID);

                $('select').attr('disabled', 'disabled');
            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('select').removeAttr('disabled');
            }
        });
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.subscribeParameters.unsubscribe();
    }
}