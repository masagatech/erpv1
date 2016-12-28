import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { AdrBookService } from '../../../_service/addressbook/adrbook-service' //Add Address Book service

declare var $: any;

@Component({
    selector: '<addressbook></addressbook>',
    templateUrl: 'adrbook.comp.html',
    providers: [AdrBookService]
})

export class AddrbookComp implements OnInit, OnDestroy {

    @Input() mod: string = "";
    @Input() adr1: any = "";
    @Input() adr2: any = "";
    @Input() mob: any = 0;
    @Input() pin: any = "";
    @Input() altmob: any = "";
    @Input() city: any = 0;
    @Input() state: any = 0;
    @Input() country: any = 0;
    @Input() adrtype: any = 0;
    @Input() landmark: any = "";
    addrbooklist: any = [];


    constructor(private _adrbookservice: AdrBookService) {

        this.getAddress();
    }


    public getAddress() {
        var _this = this;
        this._adrbookservice.getAdrBook({}).subscribe(result => {
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
        that.state = "";
        that.country = "";
        that.adrtype = "";
        that.landmark = "";
        that.mod = "";
    }

    Parameter() {
        var that = this;
        var Param = {
            "adr1": that.adr1,
            "adr2": that.adr2,
            "mob": that.mob,
            "pin": that.pin,
            "altmob": { "altmob": "9321284093" },
            "cmpid": 1,
            "city": that.city,
            "state": that.state,
            "country": that.country,
            "adrtype": that.adrtype,
            "landmark": that.landmark,
            "module": "attr",
            "entity": 1,
            "createdby": "admin",
            "remark": "",
            "remark1": "",
            "remark2": "",
            "remark3": ""
        }
        return Param;
    }

    SaveAdr() {
        var that = this;
        that._adrbookservice.saveAdrBook(
            that.Parameter()
        ).subscribe(result => {
            var dataset = result.data;
            if (dataset[0].funsave_addressbook.maxid > 0) {
                alert("Data Save Siccessfully");
                that.ClearControll();
                that.getAddress();
                return;
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

        }, 0);


    }

    ngOnDestroy() {
    }
}

