import { Injectable, Component, EventEmitter, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { CommonService } from '../../../_service/common/common-service';

declare var $: any;

@Component({
    selector: '<autocomplete></autocomplete>',
    templateUrl: 'autocomplete.comp.html',
    providers: [CommonService]
})

@Injectable()

export class AutoCompleteComponent implements OnInit, OnDestroy {
    @Input() type: string = "";
    @Input() value: string = "";
    @Input() name: string = "";
    @Output() selectedItem = new EventEmitter<any>();

    constructor(private _commonservice: CommonService) {

    }

    ngOnInit() {
    }

    getAutoComplete(me: any) {
        this._commonservice.getAutoCompleteData({ "Type": this.type, "Key": this.name }).subscribe(data => {
            $("#autocomplete").autocomplete({
                source: JSON.parse(data.data),
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.value = ui.item.value;
                    me.name = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnDestroy() {
        console.log('Destroy');
    }
}