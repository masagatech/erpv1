import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { AdrBookService } from '../../../_service/addressbook/adrbook-service' //Add Address Book service
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */

declare var $: any;

@Component({
    selector: '<addressbook></addressbook>',
    templateUrl: 'adrbook.comp.html',
    providers: [AdrBookService]
})

export class AddrbookComp implements OnInit, OnDestroy {

    adrbookid: any = 0;
    mod: string = "";
    adr1: any = "";
    adr2: any = "";
    mob: any = 0;
    pin: any = "";
    altmob: any = "";
    email: any = "";
    otheremail: any = "";
    city: any = "";
    state: any = "";
    country: any = 0;
    adrtype: any = 0;
    landmark: any = "";
    remark: any = "";
    addrbooklist: any = [];
    countryDT: any[];
    chkprimary: boolean = false;
    chkpri:boolean=false;

    constructor(private _adrbookservice: AdrBookService, private _commonservice: CommonService) {

        this.getAddress();
    }

    filldropdown() {
        var that = this;
        this._commonservice.getMOM({ "group": "Country" }).subscribe(data => {
            that.countryDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }


    AddBook() {
        var that = this;
        that.ClearControll();
        that.filldropdown();
        setTimeout(function () {
            $(".addr1").focus();
        }, 500);
    }

    public getAddress() {
        var _this = this;
        this._adrbookservice.getAdrBook({ "cmpid": 1, "flag": "" }).subscribe(result => {
            _this.addrbooklist = result.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ClearControll() {
        var that = this;
        that.adr1 = "";
        that.adr2 = "";
        that.mob = "";
        that.pin = "";
        that.altmob = "";
        that.city = "";
        that.email = "";
        that.otheremail = "";
        that.state = "";
        that.country = "";
        that.adrtype = "";
        that.landmark = "";
        that.remark="";
        that.mod = "";
    }

    EditAdr(row) {
        var _this = this;
        _this.filldropdown();
        this._adrbookservice.getAdrBook({
            "cmpid": 1,
            "adrid": row.id,
            "flag": "edit"
        }).subscribe(result => {
            var dataset = result.data;
            _this.adrbookid = dataset[0].id;
            _this.adr1 = dataset[0].address1;
            _this.adr2 = dataset[0].address2;
            _this.mob = dataset[0].mob;
            _this.altmob = dataset[0].othermob;
            _this.email = dataset[0].email;
            _this.otheremail = dataset[0].otheremail;
            _this.pin = dataset[0].pincode;
            _this.city = dataset[0].city;
            _this.state = dataset[0].state;
            _this.country = dataset[0].country;
            _this.adrtype = dataset[0].adrtype;
            _this.chkprimary = dataset[0].isprimary;
            _this.landmark = dataset[0].landmark;
            _this.chkpri=dataset[0].isprimary;
            setTimeout(function () {
                $(".addr1").focus();
            }, 500);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })


    }

    Parameter() {
        var that = this;
        var Param = {
            "adrid": that.adrbookid,
            "adr1": that.adr1,
            "adr2": that.adr2,
            "mob": that.mob == "" ? 0 : that.mob,
            "pin": that.pin,
            "altmob": that.altmob,
            "cmpid": 1,
            "city": that.city,
            "state": that.state,
            "email": that.email,
            "otheremail": that.otheremail,
            "country": that.country == "" ? 0 : that.country,
            "adrtype": that.adrtype == "" ? 0 : that.adrtype,
            "landmrk": that.landmark,
            "chkprimary": that.chkprimary,
            "module": "attr",
            "entity": 1,
            "createdby": "admin",
            "remark": that.remark,
            "remark1": "",
            "remark2": "",
            "remark3": ""
        }
        console.log(Param);
        return Param;
    }

    SaveAdr() {
        if(this.adr1=="")
        {
            alert("Please enter address1");
            $(".addr1").focus();
            return ;
        }
        if(this.mob=="")
        {
            alert("Please enter Primary Mobile No");
            $(".prymob").focus();
            return ;
        }
        if(this.email=="")
        {
            alert("Please enter address1");
            $(".email").focus();
            return ;
        }
        if(this.country==0)
        {
            alert("Please select conutry");
            $(".country").focus();
            return ;
        }
        var that = this;
        that._adrbookservice.saveAdrBook(
            that.Parameter()
        ).subscribe(result => {
            var dataset = result.data;
            if (dataset[0].funsave_addressbook.maxid > 0) {
                alert("Data Save Siccessfully");
                that.ClearControll();
                that.getAddress();
                $('#myModal').modal('hide');
            }
            console.log(dataset);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {

        setTimeout(function () {

        }, 1);
    }

    ngOnDestroy() {
    }
}

