import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../_service/common/common-service' /* add reference for view employee */
import { generateinvService } from "../../../_service/generateinvoice/generate-service";  //Service Add Refrence dcmaster-service.ts

declare var $: any;
@Component({
    templateUrl: 'generateinv.comp.html',
    providers: [generateinvService, CommonService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
})



export class generateInv implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Veriable declare
    tableDetails: any;
    DocTable: any;
    CustName: any;
    FromData: any;
    ToData: any;
    CustID: any = "";
    doclist: any[];
    invoiceModel: any = { "header": {}, "details": [] }
    invoices: any = [];
    invoiceNo: any[];
    Headerlist: any[];
    InvoiceDetails: any[];



    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private InvServies: generateinvService, private _autoservice: CommonService) { //Inherit Service dcmasterService
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.tableDetails = true;
        this.DocTable = true;
        setTimeout(function () {
            $(".Custcode").focus();
            var date = new Date();
            var FromDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            var ToDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $("#FromDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#FromDate").datepicker('setDate', FromDate);

            $("#ToDate").datepicker({
                dateFormat: "dd/mm/yy",
                minDate: 0,
                autoclose: true,
                setDate: new Date()
            });
            $("#ToDate").datepicker('setDate', ToDate);
        }, 0);
    }

    //Add Top Buttons
    actionBarEvt(evt) {
        if (evt === "save") {

            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    //All Method 

    //Auto Completed Customer Name
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

    //Get Invoice No
    getdocumentNo() {
        this.FromData = $('#FromDate').val();
        this.ToData = $('#ToDate').val();
        this.InvServies.getInvdocumentNo({
            "CmpCode": 'MTech',
            "CustCode": this.CustID,
            "FY": 5,
            "Docno": 0,
            "Fromdate": this.FromData,
            "Todate": this.ToData,
            "Flag": 'doc',
            "Flag1": ''
        }).subscribe(documentno => {
            var dataset = JSON.parse(documentno.data);
            if (dataset.length > 0) {
                this.doclist = dataset;
                 this.DocTable = false;
                 this.tableDetails = true;
            }
            else {
                alert("Record Not Found");
                this.doclist = [];
                $(".Custcode").focus();
            }
        }, err => {
            console.log('Error');
        }, () => {
            this.CustID="";
        });
    }

    //Document No Click Get Details
    getInvDetails(items) {
        this.InvServies.getInvDetails({
            "CmpCode": 'MTech',
            "CustCode": "",
            "FY": 5,
            "Docno": items.DocNo,
            "Fromdate": '',
            "Todate": '',
            "Flag": 'invdetails',
            "Flag1": ''
        }).subscribe(details => {
            var dataset = JSON.parse(details.data);
            var InvoicelocalNo = dataset.Table;
            this.invoices = [];
            for (var i = 0; i < InvoicelocalNo.length; i++) {
                var invoiceModel = { "header": {}, "details": [] };
                invoiceModel.header = dataset.Table1.filter(a => a.SubConfId === InvoicelocalNo[i].SubConfid);
                invoiceModel.details = dataset.Table2.filter(a => a.SubConfId === InvoicelocalNo[i].SubConfid);
                this.invoices.push(invoiceModel);
            }
            this.tableDetails = false;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Quntity Calculation
    private CulculateQty(items, rowdetails) {
        debugger;
        var QtyRate = 0;
        var DisAmt = 0;
        if (items.DCQty != "" && items.DCQty != "0") {
            if (items.OldQty < items.DCQty) {
                alert('Please enter valid quntity');
                for (var i = 0; i < rowdetails.length; i++) {
                    if (rowdetails[i].ProductCode === items.ProductCode && rowdetails[i].SubConfId === items.SubConfId) {
                        rowdetails[i].DCQty = items.OldQty;
                        QtyRate = items[i].DCQty * items[i].Rate;
                        DisAmt = QtyRate * items[i].Disount / 100;
                        rowdetails[i].Amount = Math.round(QtyRate - DisAmt);
                        break;
                    }
                }

            }
            else {
                for (var i = 0; i < rowdetails.length; i++) {
                    if (rowdetails[i].ProductCode === items.ProductCode && rowdetails[i].SubConfId === items.SubConfId) {
                        QtyRate = rowdetails[i].DCQty * rowdetails[i].Rate;
                        DisAmt = QtyRate * rowdetails[i].Disount / 100;
                        rowdetails[i].Amount = Math.round(QtyRate - DisAmt);
                        break;
                    }
                }
            }
        }
        for (var i = 0; i < rowdetails.length; i++) {
            if (rowdetails[i].ProductCode === items.ProductCode && rowdetails[i].SubConfId === items.SubConfId) {
                items.DCQty = items.OldQty;
                DisAmt = QtyRate * items.Disount / 100;
                items.Amount = Math.round(QtyRate - DisAmt);
                break;
            }
        }
    }

    //Sub  Total 
    private Subtotal(details) {
        var total = 0;
        for (var i = 0; i < details.length; i++) {
            total += parseInt(details[i].Amount);
        }
        return total;
    }
    //Sub  Total With Tax 
    private SubtotalTax(details) {
        var totalTax = 0;
        for (var i = 0; i < details.length; i++) {
            totalTax += parseInt(details[i].Amount);
        }
        return Math.round(totalTax * 10 / 100);;
    }

    //Grand Total
    private GrandTotal(details) {
        return Math.round(this.Subtotal(details) + this.SubtotalTax(details));
    }

    private GenerateInvoice(tabledetails, CustomerDetails) {
        var xmldata = '<r>';
        tabledetails.forEach(items => {
            xmldata += '<i>';
            xmldata += '<cu>' + CustomerDetails[0].CustName.split(':')[0] + '</cu>';
            xmldata += '<dcno>' + items.DCNo + '</dcno>';
            xmldata += '<it>' + items.ProductCode + '</it>';
            xmldata += '<itn>' + items.ProdName + '</itn>';
            xmldata += '<q>' + items.DCQty + '</q>';
            xmldata += '<r>' + items.Rate + '</r>';
            xmldata += '<d>' + items.Disount + '</d>';
            xmldata += '<a>' + items.Amount + '</a>';
            xmldata += '<cre>' + 'Admin' + '</cre>';
            xmldata += '<wh>' + 1 + '</wh>';
            xmldata += '<typ>' + 'Invoice' + '</typ>';
            xmldata += '<dirc>' + 0 + '</dirc>';
            xmldata += '</i>';
        });
        xmldata += '</r>';
        this.InvServies.GenerateInvoice({
            "XmlData": xmldata,
            "Docno": tabledetails[0].DCNo,
            "FY": 5,
            "CmpCode": 'MTech',
            "DelDate": CustomerDetails[0].DeliveryDate,
            "TaxAmt": 10,
            "Tax": 10,
            "SubConfirm": CustomerDetails[0].SubConfId,
            "LRNo": "",
            "LRDate": "",
            "Remark": "",
            "Remark1": "",
            "Remark2": "",
            "Remark3": "",
            "Flag": '',
            "Flag1": ''
        }).subscribe(details => {
            var dataset = JSON.parse(details.data);
            if (dataset[0].doc > 0) {
                alert('Data Save Successfully Document No :' + dataset[0].doc)
                var InvoicelocalNo = dataset.Table;
                this.invoices = [];
                this.getdocumentNo();
                this.tableDetails = false;
            }
            else {
                console.log(dataset);
            }

        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
        // console.log(xmldata);
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}