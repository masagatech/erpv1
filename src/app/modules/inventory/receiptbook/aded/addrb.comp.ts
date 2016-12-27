import { Component, OnInit, OnDestroy } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { RBService } from "../../../../_service/receiptbook/rb-service" /* add reference for receipt book */
import { CommonService } from "../../../../_service/common/common-service" /* add reference for validate series no */
import { MessageService, messageType } from '../../../../_service/messages/message-service';

declare var $: any;

@Component({
    templateUrl: "addrb.comp.html",
    providers: [RBService, CommonService]
})

export class AddReceiptBook implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    title: string = "";

    rbid: number = 0;
    docdate: any = "";

    newqty: number = 0;
    newseriesno: number = 0;
    newnoofpage: number = 0;

    seriesno: number = 0;
    noofpage: number = 0;
    qty: number = 0;
    narration: string = "";
    detnarr: string = "";

    rbRowData: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _rbservice: RBService, private _commonservice: CommonService, private _message: MessageService) {

    }

    // add receipt book

    private addRBRow() {
        var that = this;

        that.rbRowData = [];

        that._commonservice.checkValidate({ "flag": "receiptbook", "frmno": that.newseriesno, "tono": that.newseriesno + that.newqty, "cmpid": "2", "fyid": "7" }).subscribe(data => {
            var dataResult = data.data;
            var frmno = 0;
            frmno = that.newseriesno;

            if (dataResult[0].statusid == "1") {
                for (var i = 0; i < that.newqty; i++) {
                    that.rbRowData.push({
                        "counter": i,
                        "rbid": that.rbid,
                        "cmpid": "2",
                        "fyid": "7",
                        "docdate": that.docdate,
                        "seriesno": frmno++,
                        "noofpage": that.newnoofpage,
                        "qty": that.newqty,
                        "narration": that.narration,
                        "detnarr": that.detnarr,
                        "createdby": "1:vivek",
                        "updatedby": "1:vivek"
                    });
                }
            }
            else {
                alert(dataResult[0].status);
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
                that._message.Show(messageType.success, 'Confirmed', dataResult[0].funsave_receiptbook.msg.toString());
                that._router.navigate(["/inventory/receiptbook"]);
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

    ngOnInit() {
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
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this._message.confirm('Are you sure that you want to save?', () => {
                this.saveReceiptBook();
            });
        }
    }

    ngOnDestroy() {
        console.log("ngOnDestroy");
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}