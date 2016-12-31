import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../_service/common/common-service' /* add reference for view employee */
import { pendingdcService } from "../../../_service/pendingDC/pendingDC-service";  //Service Add Refrence dcmaster-service.ts

declare var $: any;
@Component({
    templateUrl: 'pendingdc.comp.html',
    providers: [pendingdcService, CommonService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
}) export class pendingdc implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    FromDate: any;
    ToDate: any;
    CustCode: any;
    all: any;

    //Declare Veriable Local
    docNo: any;
    Salesmandrop: any;
    CustName: any;
    docdate: any;
    Deldate: any;
    SpeInstr: any;
    customerhide: any;
    Datehide: any;
    rbtflag:any;

    //Table Hidden 
    tabledoc: any;
    tableHead: any;
    tableDetails: any;
    getbtn: any;
    CustID:any='';
    CustNam:any;

    //Declare Array Veriable
    DocDetailslist: any[];
    Salesmanlist: any[];
    doclist: any[];

    //Declare Table Veriable

    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private pendingdcServies: pendingdcService, private _autoservice: CommonService) { //Inherit Service dcmasterService
        //this.getPendingDocNo();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

       this.tabledoc=true;
       this.tableDetails=true;

        setTimeout(function () {
              $(".Custcode").focus();
            var date = new Date();
            var Fromtoday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            var Totoday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            //From Date 
            $("#FromDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#FromDate").datepicker('setDate', Fromtoday);

            $("#ToDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#ToDate").datepicker('setDate', Totoday);
        }, 0);
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "save") {
            var DirectInvoice = 0;
            var xmldata = '<r>';
            this.DocDetailslist.forEach(items => {
                xmldata += '<i>';
                xmldata += '<cu>' + this.CustName.split(':')[0] + '</cu>';
                xmldata += '<dcno>' + items.DCNo + '</dcno>';
                xmldata += '<dcdet>' + items.DCDetail + '</dcdet>';
                xmldata += '<it>' + items.ProductCode + '</it>';
                xmldata += '<itn>' + items.ProdName + '</itn>';
                xmldata += '<q>' + items.DCQty + '</q>';
                xmldata += '<dirc>' + DirectInvoice + '</dirc>';
                if (DirectInvoice == 1) {
                    xmldata += "<cnfq>" + items.DCQty + "</cnfq>";
                } else {
                    xmldata += "<cnfq>" + 0 + "</cnfq>";
                }
                xmldata += '<r>' + items.Rate + '</r>';
                xmldata += '<d>' + items.Disount + '</d>';
                xmldata += '<a>' + items.Amount + '</a>';
                xmldata += '<cre>' + 'Admin' + '</cre>';
                xmldata += '<wh>' + 1 + '</wh>';
                xmldata += '<typ>' + 'Invoice' + '</typ>';
                xmldata += '</i>';
            });
            xmldata += '</r>'
            this.pendingdcServies.ConfirmDC({
                "CmpCode": "MTech",
                "FY": 5,
                "XmlData": xmldata,
                "DocNo": this.docNo,
                "Flag": "",
                "Flag1": ""
            }).subscribe(documentno => {
                var dataset = JSON.parse(documentno.data);
                debugger;
                if (dataset[0].doc > 0) {
                    alert("Data Save Successfully Document No :" + dataset[0].doc);
                    this.DocDetailslist = [];
                    this.getPendingDocNo();
                    this.tableDetails = true;
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
            });



            //Save CLick Event
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    //Get Pending DC Document no
    getPendingDocNo() {
        this.FromDate=$("#FromDate").val();
        this.ToDate=$("#ToDate").val();
        this.pendingdcServies.getPendingDocumentNo({
            "CmpCode": "MTech",
            "FY": 5,
            "CustCode": this.CustID,//this.BankCode.split(':')[0],
            "FromDate": this.FromDate,
            "ToDate": this.ToDate,
            "Flag": "",
            "Flag1": ""
        }).subscribe(documentno => {
            var dataset = JSON.parse(documentno.data);
            if (dataset.length > 0) {
                this.doclist = dataset;
                this.tabledoc=false;
            }
            else {
                alert('Record Not Found');
                this.tabledoc=true;
                this.doclist = [];
                $(".Custcode").focus();
            }
        }, err => {
            console.log('Error');
        }, () => {
            this.CustID="";
        });
    }

    //Get Details Document No
    GetDetails(items) {
        this.pendingdcServies.getPendignDcDetails({
            "CmpCode": "MTech",
            "DocNo": items.DcNo,
            "Custcode": this.CustCode,
            "FY": 5,
            "Flag": "",
            "Flag1": ""
        }).subscribe(documentno => {
            var CustomerDetails = JSON.parse(documentno.data);
            var dcdetails = JSON.parse(documentno.Table1);
            if (CustomerDetails.length > 0 || dcdetails.length > 0) {
                this.tableDetails = false;
                this.docNo = CustomerDetails[0].DcNo;
                this.CustNam = CustomerDetails[0].CustName;
                this.Salesmandrop = CustomerDetails[0].Sales;
                this.docdate = CustomerDetails[0].DCDate;
                this.Deldate = CustomerDetails[0].DeliveryDate;
                this.SpeInstr = CustomerDetails[0].DCInstruction;
                this.DocDetailslist = dcdetails;
            }
            else {
                alert('No record found');
                this.tableDetails = true;
                return false;
            }
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Get Auto Completed Customer
     getAutoComplete(me: any) {
        var _me = this;
        this._autoservice.getAutoData({ "Type": "CustName", "Key": this.CustName }).subscribe(data => {
            $(".Custcode").autocomplete({
                source: JSON.parse(data.data),
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.CustID = ui.item.value;
                    me.CustName = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }
    
    //Quntity Calculation
    private CulculateQty(itemcode, oldQty, qty) {
        debugger;
        var QtyRate = 0;
        var DisAmt = 0;
        if (qty != "" && qty != "0") {
            if (oldQty < qty) {
                alert('Please enter valid quntity');
                for (var i = 0; i < this.DocDetailslist.length; i++) {
                    if (this.DocDetailslist[i].ProductCode === itemcode) {
                        this.DocDetailslist[i].DCQty = oldQty;
                        QtyRate = this.DocDetailslist[i].DCQty * this.DocDetailslist[i].Rate;
                        DisAmt = QtyRate * this.DocDetailslist[i].Disount / 100;
                        this.DocDetailslist[i].Amount = Math.round(QtyRate - DisAmt);
                        break;
                    }
                }
            }
            else {

                for (var i = 0; i < this.DocDetailslist.length; i++) {
                    if (this.DocDetailslist[i].ProductCode === itemcode) {
                        QtyRate = this.DocDetailslist[i].DCQty * this.DocDetailslist[i].Rate;
                        DisAmt = QtyRate * this.DocDetailslist[i].Disount / 100;
                        this.DocDetailslist[i].Amount = Math.round(QtyRate - DisAmt);
                        break;
                    }
                }
            }

        }
        else {
            for (var i = 0; i < this.DocDetailslist.length; i++) {
                if (this.DocDetailslist[i].ProductCode === itemcode) {
                    this.DocDetailslist[i].Amount = 0;
                    break;
                }
            }
        }
    }

    //Get Button Click Event
    private GetData() {
        console.log(this.all);
    }

    //Sub Total
    private SubTotal() {
        if (this.DocDetailslist != undefined) {
            var Subtotal = 0;
            for (var i = 0; i < this.DocDetailslist.length; i++) {
                Subtotal += parseInt(this.DocDetailslist[i].Amount);
            };
            return Subtotal;
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}