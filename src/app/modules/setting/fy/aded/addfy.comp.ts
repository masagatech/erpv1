import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;

@Component({
    templateUrl: 'addfy.comp.html',
    providers: [FYService, CompService, CommonService, ALSService]
})

export class AddFY implements OnInit, OnDestroy {
    title: any;
    validSuccess: Boolean = true;

    fyid: number = 0;
    fromdt: any = "";
    todt: any = "";
    isactive: boolean = false;

    @ViewChild("fromdate")
    @ViewChild("todate")

    fromdate: CalendarComp;
    todate: CalendarComp;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    CompanyDetails: any = [];

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _fyservice: FYService, private _compservice: CompService, private _commonservice: CommonService,
        private _userService: UserService, private _alsservice: ALSService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.getCompany();
    }

    ngOnInit() {
        //this.fromdate.initialize(this.loginUser);
        //this.todate.initialize(this.loginUser);
        //this.fromdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.setActionButtons.setTitle("Financial Year > Add");
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.fyid = params['id'];
                this.getFYDetailsById(this.fyid);

                $('select').attr('disabled', 'disabled');
            }
            else {
                this.setActionButtons.setTitle("Financial Year > Edit");
                setTimeout(function () {
                    $("#FromDate").focus();
                }, 0);

                //var date = new Date();
                //this.fromdate.setDate(date);
                //this.todate.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('select').removeAttr('disabled');
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveFYDetails();
        } else if (evt === "edit") {
            $('select').removeAttr('disabled');

            setTimeout(function () {
                $("#FromDate").focus();
            }, 0);

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        } else if (evt === "back") {
            this._router.navigate(['/setting/company']);
        }
    }

    getCompany() {
        this._compservice.getCompany({ "flag": "all", "fy": 0 }).subscribe(data => {
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

    getFYDetailsById(pfy: number) {
        var that = this;

        that._fyservice.getfy({ "flag": "id", "fyid": pfy }).subscribe(data => {
            var FYDT = data.data;

            that.fyid = FYDT[0].fyid;
            that.fromdt = FYDT[0].fromdt;
            that.todt = FYDT[0].todt;

            // that.fromdate.setDate(FYDT[0].fromdt);
            // that.todate.setDate(FYDT[0].todt);

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

            that.isactive = FYDT[0].isactive;
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

                //$("#C" + cmpitem.cmpid).find("p-checkbox").each(function () {
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
            "isactive": this.isactive,
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

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.subscribeParameters.unsubscribe();
    }
}