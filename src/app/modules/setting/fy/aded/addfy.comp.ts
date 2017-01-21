import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for FY */
import { CompService } from '../../../../_service/company/comp-service' /* add reference for company */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for FY */
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

declare var $: any;

@Component({
    templateUrl: 'addfy.comp.html',
    providers: [FYService, CompService, CommonService]
})

export class AddFY implements OnInit, OnDestroy {
    title: any;
    validSuccess: Boolean = true;

    fyid: number = 0;
    fromdt: any = "";
    todt: any = "";

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    CompanyDetails: any = [];

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _fyservice: FYService, private _compservice: CompService, private _commonservice: CommonService,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.getCompany();
    }

    getCompany() {
        this._compservice.getCompany({ "flag": "all" }).subscribe(data => {
            this.CompanyDetails = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    isValidSuccess() {
        if (this.fromdt == "") {
            alert("Enter From Year !!!!");
            return false;
        }
        if (this.todt == "") {
            alert("Enter To Year !!!!");
            return false;
        }

        return true;
    }

    getFYDetailsById(pfyid: number) {
        this._fyservice.getfy({ "flag": "id", "fyid": pfyid }).subscribe(data => {
            var FYDT = data.data;
            console.log(FYDT);

            this.fyid = FYDT[0].fyid;
            this.fromdt = FYDT[0].fromdt;
            this.todt = FYDT[0].todt;
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

        var saveFY = {
            "fyid": this.fyid,
            "fromdt": this.fromdt,
            "todt": this.todt,
            "uidcode": this.loginUser.login
        }

        if (this.validSuccess) {
            this._fyservice.savefy(saveFY).subscribe(data => {
                var dataResult = data.data;
                console.log(dataResult);

                if (dataResult[0].funsave_fy.doc == "1") {
                    alert(dataResult[0].funsave_fy.msg);

                    // var companyid = "";
                    // var fyrights = "<fy>";

                    // for (var i = 0; i <= this.CompanyDetails.length - 1; i++) {
                    //     companyitem = null;
                    //     companyitem = this.CompanyDetails[i];

                    //     if (companyitem !== null) {

                    //         $("#C" + companyitem.CompanyID).find("input[type=checkbox]").each(function () {
                    //             companyid += (this.checked ? $(this).val() + "," : "");
                    //         });
                    //     }
                    // }

                    // fyrights += "<id>" + dataResult[0].FYID + "</id>";
                    // fyrights = "</fy>";

                    // this.updateCompanyFYMapping(companyid, fyrights);

                    this._router.navigate(['/setting/fy']);
                }
                else if (dataResult[0].funsave_fy.doc == "-1") {
                    alert(dataResult[0].funsave_fy.msg);
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

    saveCompanyFYMap(cmpid, fyRights) {
        this._compservice.saveCompanyFYMap({ "cmpid": cmpid, "fyrights": fyRights }).subscribe(data => {
            var dataResult2 = data.data;

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
            if (params['fyid'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.fyid = params['fyid'];
                this.getFYDetailsById(this.fyid);

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