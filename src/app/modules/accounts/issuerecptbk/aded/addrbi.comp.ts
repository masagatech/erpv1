import { Component, OnInit, OnDestroy } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { RBService } from "../../../../_service/receiptbook/rb-service" /* add reference for receipt book */
import { CommonService } from "../../../../_service/common/common-service" /* add reference for validate series no */
import { ConfirmDialogModule, ConfirmationService, Message } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: "addrbi.comp.html",
    providers: [RBService, CommonService, ConfirmationService]
})

export class AddRBI implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

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

    msgs: Message[] = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _rbservice: RBService, private _commonservice: CommonService, private confirmationService: ConfirmationService) {
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
        that._rbservice.getRBDetails({ "flag": "dropdown" }).subscribe(data => {
            that.SeriesNoDT = data.data;
            console.log(that.SeriesNoDT);
        });
    }

    // Get Details By ID on Edit Mode

    getRBIDetailsByID(pirbid) {
        var that = this;
        var nop = 0;

        that._rbservice.getRBIDetails({ "flag": "id", "irbid": pirbid }).subscribe(data => {
            var rbidata = data.data[0];

            that.irbid = rbidata.irbid;
            that.rbid = rbidata.rbid;
            that.empid = rbidata.empid;
            that.empname = rbidata.empname;
            that.docno = rbidata.docno;
            that.docdate = rbidata.docdate;
            that.fromno = rbidata.fromno;
            that.tono = rbidata.tono;
            that.narration = rbidata.narration;
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

    saveRBIDetails() {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to save?',
            accept: () => {
                var saveRBI = {
                    "irbid": this.irbid,
                    "cmpid": "2",
                    "fyid": "7",
                    "docno": this.docno,
                    "docdate": this.docdate,
                    "empid": this.empid,
                    "rbid": this.rbid,
                    "fromno": this.fromno,
                    "tono": this.tono,
                    "narration": this.narration,
                    "uidcode": "1:vivek"
                }

                this._rbservice.saveRBIDetails(saveRBI).subscribe(data => {
                    var dataResult = data.data;

                    if (dataResult[0].funsave_recptbkissued.msgid != "-1") {
                        this.msgs = [];
                        this.msgs.push({ severity: 'info', summary: 'Confirmed', detail: dataResult[0].funsave_recptbkissued.msg });
                        this._router.navigate(["/accounts/receiptbookissued"]);
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
            this.saveRBIDetails();
        }
    }

    ngOnDestroy() {
        console.log("ngOnDestroy");
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}