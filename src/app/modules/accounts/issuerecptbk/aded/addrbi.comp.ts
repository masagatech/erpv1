import { Component, OnInit, OnDestroy } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { RBService } from "../../../../_service/receiptbook/rb-service" /* add reference for receipt book */
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { CommonService } from "../../../../_service/common/common-service" /* add reference for validate series no */
import { MessageService, messageType } from '../../../../_service/messages/message-service';

declare var $: any;

@Component({
    templateUrl: "addrbi.comp.html",
    providers: [RBService, CommonService]
})

export class AddRBI implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    title: string = "";

    irbid: number = 0;
    rbid: number = 0;
    empid: number = 0;
    empname: string = "";
    docno: number = 0;
    docdate: any = "";
    fromno: number = 0;
    tono: number = 0;
    narration: string = "";

    SeriesNoDT: any = [];
    latestSeriesDT: any = [];
    empSeriesDT: any = [];

    module: string = "";
    docfile: any = [];
    uploadedFiles: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _rbservice: RBService, private _commonservice: CommonService, private _msg: MessageService,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();

        this.module = "Receipt Book Issued";
        this.getLatestSeries();
        this.setDefaultDate();
        this.BindReceiptBook();
    }

    // get Auto Emp

    getEmpAuto(me: any) {
        var that = this;

        that._commonservice.getAutoData({ "type": "userwithcode", "search": that.empname }).subscribe(data => {
            $(".empname").autocomplete({
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
                    me.empid = ui.item.value;
                    me.empname = ui.item.label;

                    that.getEmpSeries(me.empid);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // Get Latest Series

    getLatestSeries() {
        var that = this;

        that._commonservice.getOtherDetails({ "flag": "latestseries", "cmpid": "2", "fyid": "7" }).subscribe(data => {
            that.latestSeriesDT = data.data;
        });
    }

    // Get Emp Series

    getEmpSeries(pempid) {
        var that = this;

        that._commonservice.getOtherDetails({ "flag": "empseries", "empid": pempid, "cmpid": "2", "fyid": "7" }).subscribe(data => {
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
            "fyid": that.loginUser.fyid,
            "irbid": pirbid
        }).subscribe(data => {
            var _rbidata = data.data[0]._rbidata;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _docfile = data.data[0]._docfile;

            that.irbid = _rbidata[0].irbid;
            that.rbid = _rbidata[0].rbid;
            that.empid = _rbidata[0].empid;
            that.empname = _rbidata[0].empname;
            that.docno = _rbidata[0].docno;
            that.docdate = _rbidata[0].docdate;
            that.fromno = _rbidata[0].fromno;
            that.tono = _rbidata[0].tono;
            that.narration = _rbidata[0].narration;

            that.uploadedFiles = _docfile == null ? [] : _uploadedfile;
            that.docfile = _docfile == null ? [] : _docfile;
        });

        return nop;
    }

    // Check Already Series No

    getFromNo() {
        var that = this;

        that._commonservice.checkValidate({ "flag": "seriesno", "rbid": that.rbid, "cmpid": "2", "fyid": "7" }).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].statusid == "1") {
                that.fromno = 1;
            }
            else {
                alert(dataResult[0].status);
                that.fromno = 0;
                that.rbid = 0;
            }
        });
    }

    // Set Default To No

    getToNoOnKey() {
        var that = this;
        var nopfno = 0;
        var noptno = 0;

        that._rbservice.getRBDetails({
            "flag": "id", "rbid": this.rbid
        }).subscribe(seriesno => {
            nopfno = seriesno.data[0].noofpage;
            noptno = that.fromno + nopfno;

            that.tono = noptno;
        });
    }

    // Check Already From No and To No

    getToNoOnTab() {
        var that = this;

        that._commonservice.checkValidate({
            "flag": "receiptbookissued", "frmno": that.fromno, "tono": that.tono, "cmpid": "2", "fyid": "7"
        }).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].statusid != "1") {
                alert(dataResult[0].status);
                that.fromno = 0;
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
            this.docfile.push({ "id": e[i].id });
        }

        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    saveRBIDetails() {
        var that = this;

        var saveRBI = {
            "irbid": this.irbid,
            "cmpid": that.loginUser.cmpid,
            "fyid": that.loginUser.fyid,
            "docno": this.docno,
            "docdate": this.docdate,
            "empid": this.empid,
            "rbid": this.rbid,
            "fromno": this.fromno,
            "tono": this.tono,
            "narration": this.narration,
            "docfile": this.docfile,
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

    // Set Default Date

    setDefaultDate() {
        var defaultdate = new Date();

        var day = ("0" + defaultdate.getDate()).slice(-2);
        var month = ("0" + (defaultdate.getMonth() + 1)).slice(-2);
        var year = defaultdate.getFullYear();

        var today = year + "-" + month + "-" + day;

        this.docdate = today;
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params["irbid"] !== undefined) {
                this.title = "Issued Receipt Book : Edit";
                this.irbid = params["irbid"];
                this.getRBIDetailsByID(this.irbid);
            }
            else {
                this.title = "Issued Receipt Book : Add";
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this._msg.confirm('Are you sure that you want to save?', () => {
                this.saveRBIDetails();
            });
        }
    }

    ngOnDestroy() {
        console.log("ngOnDestroy");
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}