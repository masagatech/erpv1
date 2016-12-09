import { Component, OnInit, Input } from '@angular/core';
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { SharedVariableService } from "../../../_service/sharedvariable-service";

@Component({
    selector: '<topdocbar></topdocbar>',
    templateUrl: 'docbar.comp.html'
})



export class DocBarComponent implements OnInit {
    

    constructor(private setActionButtons: SharedVariableService) { 

    }
    
    @Input() Input_Actionbuttons: ActionBtnProp[] = [];

    ngOnInit() {
        
    }
    callnotify(id) {
        this.setActionButtons.callActionButtonsEvent(id);
    }

}