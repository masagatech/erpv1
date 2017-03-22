import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DNService } from '../../../../_service/debitnote/dn-service' /* add reference for view employee */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
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
    duplicateaccount: Boolean = true;

    dnid: number = 0;
    docno: number = 0;
    dncustid: number = 0;
    dncustname: string = "";
    narration: string = "";
    isactive: boolean = false;
    dramt: any = "";

    uploadedFiles: any = [];
    suppdoc: any = [];

    accountsDT: any = [];
    dnRowData: any = [];
    viewDNData: any = [];

    acid: number = 0;
    acname: string = "";
    newdnid: any = 0;
    newcustid: any = 0;
    newcustname: string = "";
    newcramt: any = "";

    counter: any = 0;
    title: string = "";
    module: string = "";

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    @ViewChild("dndate")
    dndate: CalendarComp;

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    //Page Load

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _dnservice: DNService, private _userService: UserService, private _autoservice: CommonService, private _msg: MessageService,
        private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "Debit Note";

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    resetDebitNote() {
        this.dncustid = 0;
        var date = new Date();
        this.dndate.setDate(date);
        this.dramt = "";
        this.narration = "";
        this.isactive = true;
        this.dnRowData = [];
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

    //Document Ready

    ngOnInit() {
        setTimeout(function() {
            $(".dnaccname input").focus();
        }, 0);
        
        this.dndate.initialize(this.loginUser);
        this.dndate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                this.setActionButtons.setTitle("Add Debit Note");

                $('button').prop('disabled', false);
                $('.dnaccname input').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.docno = 0;
                this.resetDebitNote();

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
            }
            else if (this.isedit) {
                this.setActionButtons.setTitle("Edit Debit Note");

                $('button').prop('disabled', false);
                $('.dnaccname input').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.docno = params['id'];
                this.getDNDataByID(this.docno);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
            else {
                this.setActionButtons.setTitle("Details Of Debit Note");

                $('button').prop('disabled', true);
                $('.dnaccname input').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);

                this.docno = params['id'];
                this.getDNDataByID(this.docno);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveDNData(true);
        } else if (evt === "edit") {
            this._router.navigate(['/accounts/debitnote/edit/', this.docno]);
        } else if (evt === "delete") {
            this._msg.confirm('Are you sure that you want to delete?', () => {
                this.saveDNData(false);
            });
        } else if (evt === "back") {
            this._router.navigate(['/accounts/debitnote']);
        }
    }

    //AutoCompletd Customer

    getAutoAccounts(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "customercc",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "uid": this.loginUser.uid,
            "typ": "",
            "search": query
        }).then(data => {
            this.accountsDT = data;
        });
    }

    //Selected Inline Item Selected

    selectAutoAccounts(event, arg) {
        var that = this;
        if (arg === 1) {
            that.dncustid = event.value;
            that.dncustname = event.label;
        } else if (arg === 2) {
            that.acid = event.value;
            that.acname = event.label;
        } else {
            that.newcustid = event.value;
            that.newcustname = event.label;
        }
    }

    isDuplicateAccount() {
        var that = this;

        if (that.dncustid == that.newcustid) {
            that._msg.Show(messageType.error, "Error", "Debit Account and Credit Account Not Same");
            return true;
        }

        for (var i = 0; i < that.dnRowData.length; i++) {
            var field = that.dnRowData[i];

            if (field.acid == that.newcustid) {
                that._msg.Show(messageType.error, "Error", "Duplicate Account not Allowed");
                return true;
            }
        }

        return false;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;
        var dnRow = this.dnRowData.filter(a => a.isactive === true);

        for (var i = 0; i < dnRow.length; i++) {
            var items = dnRow[i];
            CreditAmtTotal += parseFloat(items.cramt);
        }

        return CreditAmtTotal;
    }

    private addDNRow() {
        var that = this;

        // Validation

        if (that.newcustname == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Account Name");
            return;
        }

        if (that.newcramt == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Credit");
            return;
        }

        // Duplicate items Check
        that.duplicateaccount = that.isDuplicateAccount();

        // Add New Row
        if (that.duplicateaccount == false) {
            that.dnRowData.push({
                'counter': that.counter,
                "dnid": 0,
                'acid': that.newcustid,
                'acname': that.newcustname,
                'cramt': that.newcramt,
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "docdate": that.dndate.getDate(),
                "isactive": true
            });

            that.counter++;
            that.newcustid = "";
            that.newcustname = "";
            that.newcramt = "";

            $(".accname").focus();
        }
    }

    DeleteRow(row) {
        row.isactive = false;
    }

    getDNDataByID(pdocno: number) {
        var that = this;

        that._dnservice.getDebitNote({ "flag": "edit", "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy, "docno": pdocno }).subscribe(data => {
            var _dndata = data.data[0]._dndata;
            var _dndetails = data.data[0]._dndetails;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;

            that.dnid = _dndata[0].dnid;
            that.dncustid = _dndata[0].acid;
            that.dncustname = _dndata[0].acname;

            var date = new Date(_dndata[0].docdate);
            that.dndate.setDate(date);

            that.dramt = _dndata[0].dramt;
            that.narration = _dndata[0].narration;
            that.isactive = _dndata[0].isactive;

            that.dnRowData = _dndetails;

            that.uploadedFiles = _suppdoc.length === 0 ? [] : _uploadedfile;
            that.suppdoc = _suppdoc.length === 0 ? [] : _suppdoc;

            //that.getDNDetailsByID(_dndata[0].docno);
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

    saveDNData(isactive: boolean) {
        var that = this;

        var debitamt = parseFloat(that.dramt);
        var creditamt = that.TotalCreditAmt();

        if (debitamt !== creditamt) {
            that._msg.Show(messageType.error, "Error", "Total Debit Amount and Total Credit Amount not Same !!!");
            return;
        }

        var saveDN = {
            "dnid": that.dnid,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "docdate": that.dndate.getDate(),
            "acid": that.dncustid,
            "dramt": that.dramt,
            "uidcode": that.loginUser.login,
            "narration": that.narration,
            "suppdoc": that.suppdoc,
            "isactive": isactive,
            "dndetails": that.dnRowData
        }

        that.duplicateaccount = that.isDuplicateAccount();

        if (that.duplicateaccount == false) {
            that._dnservice.saveDebitNote(saveDN).subscribe(data => {
                var dataResult = data.data;

                if (dataResult[0].funsave_debitnote.msgid != "-1") {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_debitnote.msg);
                    that._router.navigate(['/accounts/debitnote']);
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_debitnote.msg);
                }
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}