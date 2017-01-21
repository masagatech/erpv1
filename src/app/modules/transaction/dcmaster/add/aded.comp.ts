import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { dcmasterService } from "../../../../_service/dcmaster/add/dcmaster-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'aded.comp.html',
    providers: [dcmasterService, CommonService]
    //,AutoService
})

export class dcADDEdit implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Declare Veriable Local
    getCustomerAuto: any;
    custKey: any;
    CustAddress: any;
    BillAdr: any = "";
    shippAdr: any = "";
    docdate: any = "";
    delDate: any = "";
    Traspoter: any = 0;
    Token: any = "";
    SalesId: any = 0;
    OtherSalesid: any = 0;
    Salesmandrop: any;
    DirectInvoice: any = 0;
    Duplicateflag: boolean;
    Remark: any = "";
    Remark1: any = "";
    Remark2: any = "";
    Remark3: any = "";
    DocNo: any = 0;
    //Declare Array Veriable
    Salesmanlist: any = [];                                   // Salesman Static veriable for dropdown
    OtherSalesmanlist: any = [];                              // SalesmanOther Static veriable for dropdown
    Transpoterlist: any = [];                                 // Trapoter Static veriable for dropdown
    CustfilteredList: any = [];
    ItemsfilteredList: any = [];
    newAddRow: any = [];
    selected: any = [];

    //Declare Table Veriable
    DCDetelId: any;
    Dis: any = 0;
    Rate: any = 0;
    Amount: any = 0;
    qty: any = 0;
    Total: any = 0;
    DisTotal: any = 0;
    counter: any;
    Prod: any = 0;
    totalQty: any = 0;
    totalAmt: any = 0;
    CustID: any = 0;
    CustName: any = '';
    itemsname: any = '';
    itemsid: any = 0;
    ProdSelectedCode: any = '';
    NewItemsName: any = "";
    NewItemsid: any = 0;
    AddEdit: any = '';
    footer: any;
    private subscribeParameters: any;
    //user details
    loginUser: LoginUserModel;
    loginUserName: string;


    //, private _autoservice:AutoService
    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private dcServies: dcmasterService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _userService: UserService) {
        this.newAddRow = [];
        this.counter = 0;
        this.totalQty = 0;
        this.totalAmt = 0;
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        //Hide Show And Flage Add Edit
        this.AddEdit = 'add'
        this.footer = true;
        setTimeout(function () {
            var date = new Date();
            var docdate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $("#docDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#docDate").datepicker('setDate', docdate);

            $("#delDate").datepicker({
                dateFormat: "dd/mm/yy",
                minDate: 0,
                autoclose: true,
                setDate: new Date()
            });
            $("#delDate").datepicker('setDate', docdate);
            $('.Custcode').focus();
        }, 0);

        //Edit Mode

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.DocNo = params['id'];
                this.GetEditData(this.DocNo);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }



    //Clear All Controll
    private ClearControll() {
        this.CustName = "";
        this.Salesmandrop = "";
        this.OtherSalesid = "";
        this.Traspoter = "";
        this.Token = "";
        this.BillAdr = "";
        this.shippAdr = "";
        this.Remark1 = "";
        this.Remark2 = "";
        this.newAddRow = [];

    }

    paramterjson() {
        this.docdate = $('#docDate').datepicker('getDate');
        this.delDate = $('#delDate').datepicker('getDate');
        var param = {
            "dcno": this.DocNo,
            "docdate": this.docdate,
            "acid": 1,
            "refno": this.Token,
            "deldate": this.delDate,
            "salesid": this.Salesmandrop,
            "othersalesid": this.OtherSalesid,
            "traspo": this.Traspoter,
            "billingadr": this.BillAdr,
            "shippadr": this.shippAdr,
            "fy": this.loginUser.fyid,
            "cmpid": this.loginUser.cmpid,
            "createdby": this.loginUser.login,
            "remark": this.Remark,
            "directinvoice": this.DirectInvoice,
            "dcdetails": this.newAddRow,
            "remark1": this.Remark1,
            "remark2": this.Remark2,
            "remark3": this.Remark3
        }
        return param;
    }

    //Add Top Buttons
    actionBarEvt(evt) {
        this.DirectInvoice = 0;
        if (evt === "back") {
            this._router.navigate(['transaction/dcmaster/view']);
        }
        if (evt === "save") {
            if (this.CustName == '' || this.CustName == undefined) {
                alert('Please Enter Customer');
                return false;
            }
            if (this.Salesmandrop == '' || this.Salesmandrop == undefined) {
                alert('Please Select Salesman');
                return false;
            }
            if (this.Traspoter == '' || this.Traspoter == undefined) {
                alert('Please Select Transpoter');
                return false;
            }
            if (this.newAddRow.length == 0) {
                alert('Please Enter Items Details');
                return false;
            }
            this.dcServies.saveDcMaster(
                this.paramterjson()
            ).subscribe(result => {
                var returndata = result.data;
                if (returndata[0].funsave_dcmaster.maxid > 0) {
                    alert("Data Save Succesfuly Document No: " + returndata[0].funsave_dcmaster.maxid)
                    this.ClearControll();
                    $('.Custcode').focus();
                }
                else {
                    console.log(returndata);
                }
            }, err => {
                console.log(err);
            }, () => {
                //console.log("Done");
            })
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            this.dcServies.deleteDcMaster({
                "DCNo": this.DocNo,
                "DCDetelId": 0,
                "CmpCode": "Mtech",
                "FY": 5,
                "UserCode": "Admin",
                "Flag": "DC"
            }).subscribe(data => {
                var dataset = data.data;
                if (dataset.Table[0].doc > 0) {
                    alert('Delete Data Successfully Document :' + dataset.Table[0].doc)
                    this.ClearControll();
                    $('input').removeAttr('disabled');
                    $('select').removeAttr('disabled');
                    $('textarea').removeAttr('disabled');
                    this.actionButton.find(a => a.id === "save").hide = false;
                    this.actionButton.find(a => a.id === "save").hide = false;
                    $('.Custcode').focus();
                }
                else {
                    console.log(dataset.Table[0].status)
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        }
    }

    GetEditData(Docno) {
        this.dcServies.getDcmasterView({
            "flag": "edit",
            "doc": Docno,
            "cmpid": this.loginUser.fyid,
            "fy": this.loginUser.fyid,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            var dataset = data.data;
            var CustomerMaster = dataset[0];

            if (CustomerMaster.length > 0) {
                this.CustomerSelected(CustomerMaster[0].acid);
                this.CustName = CustomerMaster[0].acname;
                this.CustID = CustomerMaster[0].acid;
                this.docdate = CustomerMaster[0].dcdate;
                this.delDate = CustomerMaster[0].deldate;
                this.Token = CustomerMaster[0].refno;
                this.BillAdr = CustomerMaster[0].billadr;
                this.shippAdr = CustomerMaster[0].shippadr;
                this.Remark = CustomerMaster[0].remark;
                this.Remark2 = CustomerMaster[0].remark1;
                this.Salesmandrop = CustomerMaster[0].salesid;
                this.OtherSalesid = CustomerMaster[0].othersalid;
                this.Traspoter = CustomerMaster[0].transid;
                this.newAddRow = dataset[1];
            }
            else {
                console.log('Error');
            }

        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }


    //Auto Completed Customer Name
    getAutoComplete(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "customer",
            "search": _me.CustName,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fyid,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".Custcode").autocomplete({
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
                    me.CustID = ui.item.value;
                    me.CustName = ui.item.label;
                    _me.CustomerSelected(me.CustID);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //AutoCompletd Product Name
    getAutoCompleteProd(me: any, arg: number) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "CatProdName",
            "search": arg == 0 ? me.NewItemsName : me.ItemsName,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fyid,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".ProdName").autocomplete({
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
                    me.itemsname = ui.item.label;
                    if (arg === 1) {
                        me.itemsname = ui.item.label;
                        me.itemsid = ui.item.value;
                        _me.ItemsSelected(me.Itemsid);
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.Itemsid = ui.item.value;
                        _me.ItemsSelected(me.Itemsid);
                    }
                    //   me.ItemsKey = ui.item.label;
                    //  _me.ItemsSelected(me.ItemsID);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // //Selected Customer  Event
    CustomerSelected(val) {
        if (val != "") {
            this.custKey = val;
            this.dcServies.getdropdwn({                     //User getdcdropdown
                "custid": val,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fyid,
                "createdby": this.loginUser.login,
                "flag": '',
                "flag1": ''
            }).subscribe(dropdetails => {
                var dataset = dropdetails.data;                 //Return Data
                this.Salesmanlist = dataset[0];
                this.Transpoterlist = dataset[1];              //Return Data
                this.BillAdr = dataset[2][0].adr;
                this.shippAdr = dataset[2][0].adr;
            }, err => {
                console.log('Error');
            }, () => {
                // console.log('Complet');
            });
            this.CustfilteredList = [];
        }
    }

    // //Selected Items
    ItemsSelected(val) {
        debugger;
        if (val != "") {
            this.dcServies.getItemsAutoCompleted({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fyid,
                "itemsid": val,
                "createdby": this.loginUser.login
            }).subscribe(itemsdata => {
                console.log(itemsdata.data);
                var ItemsResult = itemsdata.data;

                // if (this.newAddRow.length == 0) {
                //     this.AddEdit = 'add'
                // }
                // if (this.AddEdit === 'add') {
                this.qty = 1;
                this.Dis = ItemsResult[0].dis;
                this.Rate = ItemsResult[0].salerate;
                this.Amount = ItemsResult[0].dcamt;
                //this.ItemsfilteredList = [];
                //  }
                // else {
                //     for (var i = 0; i < this.newAddRow.length; i++) {
                //         if (this.newAddRow[i].counter === this.AddEdit) {
                //             this.newAddRow[i].Qty = 1;
                //             this.newAddRow[i].Dis = ItemsResult[0].Discount;
                //             this.newAddRow[i].Rate = ItemsResult[0].MRPRate;
                //             this.newAddRow[i].Amount = ItemsResult[0].Amount;
                //             break;
                //         }
                //     }

                //}
            }, err => {
                console.log("Error");
            }, () => {
                //console.log("Done");
            });
        }
    }

    //Add New Row
    private NewRowAdd() {
        if (this.itemsname == '' || this.itemsname == undefined) {
            alert('Please Enter items Name');
            return;
        }
        if (this.qty == '' || this.qty == undefined) {
            alert('Please Enter Quntity');
            return;
        }
        if (this.Dis > 100) {
            alert('Please Valid Discount')
            return;
        }
        this.Duplicateflag = true;
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].ItemsName == this.itemsname) {
                this.Duplicateflag = false;
                break;
            }
        }
        if (this.Duplicateflag == true) {
            debugger;
            this.newAddRow.push({
                "autoid": 0,
                'itemsname': this.itemsname,
                "itemsid": this.itemsid,
                'qty': this.qty,
                'rate': this.Rate,
                'dis': this.Dis == "" ? "0" : this.Dis,
                'amount': this.Amount,
                'counter': this.counter
            });

            this.counter++;
            this.itemsname = "";
            this.NewItemsName = "";
            this.qty = "";
            this.Rate = "";
            this.Dis = "";
            this.Amount = "";
            $("#foot_custname").focus();
        }
        else {
            alert('Duplicate Item');
            return;
        }

    }

    //Quntity Calculation
    private ConfirmQty(Qty) {
        this.Total = this.qty * this.Rate;
        this.DisTotal = this.Total * this.Dis / 100;
        this.Amount = Math.round(this.Total - this.DisTotal);
    }

    //Edit Row Quntity Calculation
    private ConfirmQtyEdit(counter, qty) {
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].counter === this.AddEdit) {
                this.Total = qty * this.newAddRow[i].Rate;
                this.DisTotal = this.Total * this.newAddRow[i].Dis / 100;
                this.newAddRow[i].Amount = Math.round(this.Total - this.DisTotal);
                break;
            }
        }

    }

    private TotalQty() {
        var total = 0;
        if (this.newAddRow.length > 0) {
            for (var i = 0; i < this.newAddRow.length; i++) {
                total += parseInt(this.newAddRow[i].qty);
            }
        }
        return total;
    }

    private TotalAmount() {
        var totalamt = 0;
        if (this.newAddRow.length > 0) {
            for (var i = 0; i < this.newAddRow.length; i++) {
                totalamt += parseInt(this.newAddRow[i].amount);
            }
        }
        return totalamt;
    }

    //Delete Row 
    private DeleteRow(val, DcDelid) {
        if (DcDelid != "" || DcDelid != undefined) {
            this.dcServies.deleteDcMaster({
                "DCNo": 0,
                "DCDetelId": DcDelid,
                "FY": this.loginUser.fyid,
                "cmpid": this.loginUser.cmpid,
                "UserCode": this.loginUser.login,
                "Flag": ""
            }).subscribe(data => {
                var dataset = JSON.parse(data.data);
                $("#foot_custname").focus();
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        }
        var index = -1;
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].counter === val) {
                index = i;
                // this.QtyCount -= parseInt(this.newAddRow[i].Qty);
                // $scope.AmountCount -= this.newAddRow[i].amount;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.newAddRow.splice(index, 1);
    }

    private rowclick(val) {
        this.AddEdit = val;
        console.log(val);
    }
    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }

}