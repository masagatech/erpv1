import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from '../../../_service/common/common-service';


declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'test.comp.html',
    providers: [CommonService]
    //,AutoService
}) export class test implements OnInit, OnDestroy {

    country: any;

    countries: any[];

    filteredCountriesSingle: any[];

    filteredCountriesMultiple: any[];

    brands: string[] = ['Audi', 'BMW', 'Fiat', 'Ford', 'Honda', 'Jaguar', 'Mercedes', 'Renault', 'Volvo', 'VW'];

    filteredBrands: any[];

    brand: string;

    constructor(private _common: CommonService) {


    }

    filterCountrySingle(event) {
        let query = event.query;
        this._common.getAutoDataGET({ "type": "customer", "cmpid": 2, "search": query }).then(countries => {
            this.filteredCountriesSingle = countries;
        });
    }
    //Add Save Edit Delete Button
    ngOnInit() {

    }



    ngOnDestroy() {

    }
}