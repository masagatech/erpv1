import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { RBService } from "../../../../_service/receiptbook/rb-service" /* add reference for receipt book */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { CommonService } from "../../../../_service/common/common-service" /* add reference for validate series no */
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: "addrbi.comp.html",
    providers: [RBService, CommonService, ALSService]
})

export class AddRBI implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    formvals: string = "";
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    title: string = "";

    irbid: number = 0;
    rbid: number = 0;
    empid: number = 0;
    empname: string = "";
    docno: number = 0;

    @ViewChild("docdate")
    docdate: CalendarComp;

    fromno: any = "";
    tono: any = "";
    narration: string = "";

    SeriesNoDT: any = [];
    latestSeriesDT: any = [];
    employeeDT: any = [];
    empSeriesDT: any = [];

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _rbservice: RBService, private _autoservice: CommonService, private _msg: MessageService,
        private _userService: UserService, private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();

        this.module = "Receipt Book Issued";
        this.getLatestSeries();
        this.BindReceiptBook();
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "rbi", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.docdate.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.docdate.initialize(this.loginUser);
        this.docdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params["irbid"] !== undefined) {
                this.setActionButtons.setTitle("Receipt Book Issued");

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.actionButton.find(a => a.id === "delete").hide = true;

                this.irbid = params["irbid"];
                this.getRBIDetailsByID(this.irbid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
                $(".empname input").focus();
            }
            else {
                this.setActionButtons.setTitle("Receipt Book Issued");

                var date = new Date();
                this.docdate.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
                $(".empname input").focus();
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveRBIDetails();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        } else if (evt === "back") {
            this._router.navigate(['/accounts/receiptbookissued']);
        }
    }

    // Auto Completed Employee

    getAutoEmp(event) {
        var that = this;

        let query = event.query;
        that._autoservice.getAutoDataGET({
            "type": "userwithcode",
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "search": query
        }).then(data => {
            that.employeeDT = data;
        });
    }

    // Selected Employee

    selectAutoEmp(event) {
        var that = this;

        that.empid = event.value;
        that.empname = event.label;

        that.getEmpSeries(that.empid);
    }

    // Get Latest Series

    getLatestSeries() {
        var that = this;

        that._autoservice.getOtherDetails({ "flag": "latestseries", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy }).subscribe(data => {
            that.latestSeriesDT = data.data;
        });
    }

    // Get Emp Series

    getEmpSeries(pempid) {
        var that = this;

        that._autoservice.getOtherDetails({
            "flag": "empseries", "empid": pempid, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            that.empSeriesDT = data.data;
        });
    }

    // Bind Series No

    BindReceiptBook() {
        var that = this;
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            this.irbid = params["irbid"];
            that._rbservice.getRBDetails({ "flag": "dropdown", "irbid": this.irbid }).subscribe(data => {
                that.SeriesNoDT = data.data;
                console.log(that.SeriesNoDT);
            });
        });
    }

    // Get Details By ID on Edit Mode

    getRBIDetailsByID(pirbid) {
        var that = this;
        var nop = 0;

        that._rbservice.getRBIDetails({
            "flag": "id",
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "irbid": pirbid
        }).subscribe(data => {
            var _rbidata = data.data[0]._rbidata;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;

            that.irbid = _rbidata[0].irbid;
            that.rbid = _rbidata[0].rbid;
            that.empid = _rbidata[0].empid;
            that.empname = _rbidata[0].empname;
            that.docno = _rbidata[0].docno;
            that.docdate.setDate(_rbidata[0].docdate);
            that.fromno = _rbidata[0].fromno;
            that.tono = _rbidata[0].tono;
            that.narration = _rbidata[0].narration;

            that.uploadedFiles = _uploadedfile == null ? [] : _uploadedfile;
            that.suppdoc = _uploadedfile == null ? [] : _suppdoc;
        });

        return nop;
    }

    // Check Already Series No

    getFromNo() {
        var that = this;

        that._autoservice.checkValidate({
            "flag": "seriesno", "rbid": that.rbid, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].statusid == "1") {
                that.fromno = 1;
            }
            else {
                that._msg.Show(messageType.error, "Error", dataResult[0].status);
                that.fromno = 0;
                that.rbid = 0;
            }
        });
    }

    // Set Default To No

    getToNoOnKey() {
        var that = this;
        var noofpage: number = 0;

        that._rbservice.getRBDetails({
            "flag": "id", "docno": that.rbid
        }).subscribe(seriesno => {
            if (seriesno.data.length > 0) {
                noofpage = parseFloat(seriesno.data[0].noofpage);
                that.tono = parseFloat(that.fromno) + noofpage;
            }
            else {
                that.tono = 0;
            }
        });
    }

    // Check Already From No and To No

    getToNoOnTab() {
        var that = this;

        that._autoservice.checkValidate({
            "flag": "receiptbookissued", "frmno": that.fromno, "tono": that.tono, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].statusid != "1") {
                that._msg.Show(messageType.error, "Error", dataResult[0].status);
                that.tono = 0;
            }
        });
    }

    // Save Receipt Book Issued

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.suppdoc.push({ "id": e[i].id });
        }

        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    private isFormChange() {
        return (this.formvals == $("#frmpdc").serialize());
    }

    saveRBIDetails() {
        var that = this;

        var validateme = commonfun.validate();

        if (!validateme.status) {
            that._msg.Show(messageType.error, "error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }

        var saveRBI = {
            "irbid": that.irbid,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "docno": that.docno,
            "docdate": that.docdate.getDate(),
            "empid": that.empid,
            "rbid": that.rbid,
            "fromno": that.fromno,
            "tono": that.tono,
            "narration": that.narration,
            "suppdoc": that.suppdoc,
            "uidcode": that.loginUser.login
        }

        that._rbservice.saveRBIDetails(saveRBI).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_recptbkissued.msgid != "-1") {
                that._msg.Show(messageType.success, 'Confirmed', dataResult[0].funsave_recptbkissued.msg.toString());
                that._router.navigate(["/accounts/receiptbookissued"]);
            }
            else {
                that._msg.Show(messageType.error, 'Error', dataResult[0].funsave_recptbkissued.msg.toString());
            }
        }, err => {
            that._msg.Show(messageType.error, 'Error', err);
        }, () => {
            // console.log("Complete");
        });
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}