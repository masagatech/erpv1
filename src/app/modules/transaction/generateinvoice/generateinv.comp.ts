import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../_service/common/common-service' /* add reference for view employee */
import { generateinvService } from "../../../_service/generateinvoice/generate-service";  //Service Add Refrence dcmaster-service.ts
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { CalendarComp } from '../../usercontrol/calendar';
import { ALSService } from '../../../_service/auditlock/als-service';
import { MessageService, messageType } from '../../../_service/messages/message-service';

declare var $: any;
@Component({
    templateUrl: 'generateinv.comp.html',
    providers: [generateinvService, CommonService, ALSService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
})
export class generateInv implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Veriable declare
    tableDetails: any;
    CustName: any;
    CustID: any = "";
    doclist: any[];
    invoiceModel: any = { "header": {}, "details": [] }
    invoices: any = [];
    invoiceNo: any[];
    Headerlist: any[];
    InvoiceDetails: any[];

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Calendor
    @ViewChild("fromdatecal")
    fromdatecal: CalendarComp;

    @ViewChild("todatecal")
    todatecal: CalendarComp;

    CustomerAutodata: any[];



    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private InvServies: generateinvService,
        private _autoservice: CommonService, private _userService: UserService,
        private _alsservice: ALSService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }

    //Date 
    setAuditDate() {
        var that = this;
        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "so", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.fromdatecal.setMinMaxDate(new Date(lockdate), null);
            that.todatecal.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.fromdatecal.initialize(this.loginUser);
        this.fromdatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.todatecal.initialize(this.loginUser);
        this.todatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.tableDetails = true;
        setTimeout(function () {
            $(".Custcode input").focus();
        }, 0);
        var date = new Date();
        this.fromdatecal.setDate(date);
        this.todatecal.setDate(date);
    }
    loadRBIGrid(event: LazyLoadEvent) {

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

    CustomerAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "customer",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "search": query
            }).then(data => {
                this.CustomerAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Selected Customer Id And Name
    CustomerSelect(event) {
        this.CustID = event.value;
        this.CustName = event.label;
    }

    //Get Invoice No
    getdocumentNo() {
        this.InvServies.getInvdocumentNo({
            "cmpid": this.loginUser.cmpid,
            "acid": this.CustID,
            "fy": this.loginUser.fy,
            // "Fromdate": this.FromData,
            // "Todate": this.ToData,
            "createdby":this.loginUser.login,
            "flag1": ''
        }).subscribe(documentno => {
            var dataset = documentno.data;
            if (dataset.length > 0) {
                this.doclist = dataset;
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
        });
    }

    //Document No Click Get Details
    getInvDetails(items) {
        this.InvServies.getInvDetails({
            "cmpid":this.loginUser.cmpid,
            "FY": this.loginUser.fy,
            "docno": items.docno,
            "Flag": 'invdetails',
            "Flag1": ''
        }).subscribe(details => {
            var dataset = details.data;
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