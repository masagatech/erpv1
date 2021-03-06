import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { RBService } from "../../../../_service/receiptbook/rb-service" /* add reference for receipt book */
import { CommonService } from "../../../../_service/common/common-service" /* add reference for validate series no */
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;

@Component({
    templateUrl: "addrb.comp.html",
    providers: [RBService, CommonService, ALSService]
})

export class AddReceiptBook implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    title: string = "";

    rbid: number = 0;

    @ViewChild("docdate")
    docdate: CalendarComp;

    newqty: number = 0;
    newseriesno: number = 0;
    newnoofpage: number = 0;

    seriesno: number = 0;
    noofpage: number = 0;
    qty: number = 0;
    narration: string = "";
    detnarr: string = "";

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    rbRowData: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _rbservice: RBService, private _commonservice: CommonService, private _msg: MessageService,
        private _userService: UserService, private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "Receipt Book";
    }

    resetReceiptBook() {
        var date = new Date();
        this.docdate.setDate(date);
        this.narration = "";
        this.rbRowData = [];
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "rb", "fy": that.loginUser.fy
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
        this.setActionButtons.setTitle("Receipt Book");
        this.docdate.initialize(this.loginUser);
        this.docdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params["rbid"] !== undefined) {
                this.title = "Receipt Book : Edit";
                this.rbid = params["rbid"];
                this.getRBDetailsByID(this.rbid);
            }
            else {
                this.title = "Receipt Book : Add";
                this.rbid = 0;
                this.resetReceiptBook();
            }
        });
    }

    // add receipt book

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.suppdoc.push({ "id": e[i].id });
        }

        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    private addRBRow() {
        var that = this;

        that.rbRowData = [];

        that._commonservice.checkValidate({
            "flag": "receiptbook", "frmno": that.newseriesno, "tono": that.newseriesno + that.newqty,
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var frmno = 0;
            frmno = that.newseriesno;

            if (dataResult[0].statusid == "1") {
                for (var i = 0; i < that.newqty; i++) {
                    that.rbRowData.push({
                        "rbid": that.rbid,
                        "cmpid": that.loginUser.cmpid,
                        "fy": that.loginUser.fy,
                        "docdate": that.docdate.getDate(),
                        "seriesno": frmno++,
                        "noofpage": that.newnoofpage,
                        "qty": that.newqty,
                        "narration": that.narration,
                        "detnarr": that.detnarr,
                        //"suppdoc": this.suppdoc,
                        "uidcode": that.loginUser.login
                    });
                }
            }
            else {
                that._msg.Show(messageType.info, 'Info', dataResult[0].status);
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    // save receipt book

    saveReceiptBook() {
        var that = this;

        var saveRB = {
            "receiptbook": that.rbRowData
        }

        that._rbservice.saveRBDetails(saveRB).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_receiptbook.msgid != "-1") {
                that._msg.Show(messageType.success, 'Confirmed', dataResult[0].funsave_receiptbook.msg.toString());
                that._router.navigate(["/inventory/receiptbook"]);
            }
            else {
                that._msg.Show(messageType.error, 'Error', dataResult[0].funsave_receiptbook.msg.toString());
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    // get rb details by id

    getRBDetailsByID(prbid: number) {
        this._rbservice.getRBDetails({ "flag": "id", "docno": prbid }).subscribe(data => {
            var dataresult = data.data;

            this.rbid = dataresult[0].rbid;
            this.docdate = dataresult[0].docdate;
            this.newseriesno = dataresult[0].seriesno;
            this.newqty = dataresult[0].qty;
            this.newnoofpage = dataresult[0].noofpage;
            this.narration = dataresult[0].narration;

            this.rbRowData = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveReceiptBook();
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}