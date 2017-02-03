import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DNService } from '../../../../_service/debitnote/dn-service' /* add reference for view employee */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;

@Component({
    templateUrl: 'adddebitnote.comp.html',
    providers: [DNService, CommonService, ALSService]
})

export class AddDebitNote implements OnInit, OnDestroy {
    viewCustomerDT: any[] = [];
    loginUser: LoginUserModel;
    duplicateacid: Boolean = true;

    dnid: number = 0;
    dnacid: number = 0;
    dnacname: string = "";
    dramt: any = "";
    narration: string = "";
    uploadedFiles: any = [];
    suppdoc: any = [];

    dnRowData: any = [];
    viewDNData: any = [];

    newdnid: any = 0;
    newacid: any = 0;
    newacname: string = "";
    newdramt: any = "";
    newcramt: any = "";

    counter: any;
    title: string = "";
    module: string = "";

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    @ViewChild("dndate")
    dndate: CalendarComp;

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _dnservice: DNService, private _commonservice: CommonService, private _userService: UserService,
        private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "Debit Note";
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "dn", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.dndate.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.dndate.initialize(this.loginUser);
        this.dndate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.title = "Edit Debit Note";
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.dnid = params['id'];
                this.getDNDataByID(this.dnid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.title = "Add Debit Note";

                var date = new Date();
                this.dndate.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveDNData();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    isDuplicateacid() {
        for (var i = 0; i < this.dnRowData.length; i++) {
            var field = this.dnRowData[i];

            if (field.acid == this.newacid) {
                alert("Duplicate Account not Allowed");
                this.newacid = "";
                this.newacname = "";
                return true;
            }
        }

        return false;
    }

    private NewRowAdd() {
        var that = this;

        if (this.newacname == "" || this.newacname == null) {
            alert("Please Enter Account Name");
            return;
        }

        if (this.newcramt == "" || this.newcramt == null) {
            alert("Please Enter Credit");
            return;
        }

        //Duplicate items Check
        this.duplicateacid = this.isDuplicateacid();

        //Add New Row
        if (this.duplicateacid == false) {
            this.dnRowData.push({
                'counter': that.counter,
                "dnid": 0,
                'acid': that.newacid,
                'acname': that.newacname,
                'cramt': that.newcramt,
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "docdate": "" + that.dndate.getDate() + ""
            });

            this.counter++;
            this.newacid = "";
            this.newacname = "";
            this.newcramt = "";
        }
    }

    getAutoComplete(me: any, arg: number) {
        var that = this;

        this._commonservice.getAutoData({
            "type": "customer", "cmpid": this.loginUser.cmpid,
            "search": arg == 1 ? me.acname : arg == 2 ? me.dnacname : me.newacname
        }).subscribe(data => {
            $(arg == 1 ? ".accname" : arg == 2 ? ".dnaccname" : ".accname").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    if (arg === 1) {
                        me.acname = ui.item.label;
                        me.acid = ui.item.value;
                    } else if (arg === 2) {
                        me.dnacname = ui.item.label;
                        me.dnacid = ui.item.value;
                    } else {
                        me.newacname = ui.item.label;
                        me.newacid = ui.item.value;
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getDNDataByID(pdnid: number) {
        var that = this;

        that._dnservice.getDebitNote({ "flag": "edit", "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy, "dnid": pdnid }).subscribe(data => {
            var _dndata = data.data[0]._dndata;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;

            that.dnid = _dndata[0].dnid;
            that.dnacid = _dndata[0].acid;
            that.dnacname = _dndata[0].acname;

            var date = new Date(_dndata[0].docdate);
            that.dndate.setDate(date);

            that.dramt = _dndata[0].dramt;
            that.narration = _dndata[0].narration;

            that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
            that.suppdoc = _suppdoc == null ? [] : _suppdoc;

            that.getDNDetailsByID(_dndata[0].docno);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getDNDetailsByID(pdocno: number) {
        this._dnservice.getDebitNote({ "flag": "details", "docno": pdocno }).subscribe(data => {
            this.dnRowData = data.data;
            console.log(this.dnRowData);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        var that = this;

        for (var i = 0; i < e.length; i++) {
            that.suppdoc.push({ "id": e[i].id });
        }

        that.actionButton.find(a => a.id === "save").enabled = true;
    }

    saveDNData() {
        var that = this;

        var saveDN = {
            "dnid": that.dnid,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "docdate": that.dndate.getDate(),
            "acid": that.dnacid,
            "dramt": that.dramt,
            "narration": that.narration,
            "uidcode": that.loginUser.login,
            "suppdoc": that.suppdoc,
            "dndetails": that.dnRowData
        }

        that.duplicateacid = that.isDuplicateacid();
        console.log(that.duplicateacid);

        if (that.duplicateacid == false) {
            that._dnservice.saveDebitNote(saveDN).subscribe(data => {
                var dataResult = data.data;

                if (dataResult[0].funsave_debitnote.msgid != "-1") {
                    alert(dataResult[0].funsave_debitnote.msg);
                    that._router.navigate(['/accounts/debitnote']);
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

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}