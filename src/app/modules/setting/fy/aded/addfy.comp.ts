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
import { MessageService, messageType } from '../../../../_service/messages/message-service';

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
        private _userService: UserService, private _msg: MessageService) {
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
            this._msg.Show(messageType.warn, "Warning", "Enter From Year");
            return false;
        }
        if (this.todt == "") {
            this._msg.Show(messageType.warn, "Warning", "Enter To Year");
            return false;
        }

        return true;
    }

    getFYDetailsById(pfyid: number) {
        this._fyservice.getfy({ "flag": "id", "fyid": pfyid }).subscribe(data => {
            var FYDT = data.data;

            this.fyid = FYDT[0].fyid;
            this.fromdt = FYDT[0].fromdt;
            this.todt = FYDT[0].todt;

            var cmprights = null;
            var cmpitem = null;

            if (FYDT[0] != null) {
                cmprights = null;
                cmprights = FYDT[0].cmprights;

                if (cmprights != null) {
                    for (var i = 0; i <= cmprights.length - 1; i++) {
                        cmpitem = null;
                        cmpitem = cmprights[i];

                        if (cmpitem != null) {
                            $("#C" + cmpitem.cmpid).find("#" + cmpitem.cmpid).prop('checked', true);
                        }
                    }
                }
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getCompanyRights() {
        var that = this;

        var GiveRights = [];
        var cmpitem = null;

        for (var i = 0; i <= that.CompanyDetails.length - 1; i++) {
            cmpitem = null;
            cmpitem = that.CompanyDetails[i];

            if (cmpitem !== null) {
                var cmprights = "";

                $("#C" + cmpitem.cmpid).find("input[type=checkbox]").each(function () {
                    cmprights += (this.checked ? $(this).val() + "," : "");
                });

                if (cmprights != "") {
                    GiveRights.push({ "cmpid": cmprights.slice(0, -1) });
                }
            }
        }

        return GiveRights;
    }

    saveFYDetails() {
        this.validSuccess = this.isValidSuccess();
        var cmprights = this.getCompanyRights();

        var saveFY = {
            "fyid": this.fyid,
            "fromdt": this.fromdt,
            "todt": this.todt,
            "uidcode": this.loginUser.login,
            "cmprights": cmprights
        }

        if (this.validSuccess) {
            this._fyservice.savefy(saveFY).subscribe(data => {
                var dataResult = data.data;

                if (dataResult[0].funsave_fy.msgid == "1") {
                    this._msg.Show(messageType.success, "Success", dataResult[0].funsave_fy.msg);
                    this._router.navigate(['/setting/fy']);
                }
                else if (dataResult[0].funsave_fy.msgid == "-1") {
                    this._msg.Show(messageType.warn, "Warning", dataResult[0].funsave_fy.msg);
                }
                else {
                    this._msg.Show(messageType.success, "Success", dataResult[0].funsave_fy.msg);
                }
            }, err => {
                this._msg.Show(messageType.success, "Success", err);
            }, () => {
                // console.log("Complete");
            });
        }
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