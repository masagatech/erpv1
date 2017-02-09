import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ActionBtnProp, Details } from '../../app/_model/action_buttons'
import { LoginUser } from '../../app/_model/user_model'

declare var browserConf: any;

@Injectable()
export class SharedVariableService {


    constructor() {

    }



    // Observable string sources
    private actionButtonSource = new Subject<ActionBtnProp[]>();
    private topBarEventSource = new Subject<Details>();

    private actionButtonEventSource = new Subject<string>();

    // Observable string streams
    public setActionButtons$ = this.actionButtonSource.asObservable();
    public topBarSettingsEvent$ = this.topBarEventSource.asObservable();
    public setActionButtonsEvent$ = this.actionButtonEventSource.asObservable();
    // public setBreadCrumbEvent$ = this.breadCrumbEventSource.asObservable();

    //action buttons
    setActionButtons(actionButtons: ActionBtnProp[]) {

        var _d = new Details("buttons", actionButtons);
        this.topBarEventSource.next(_d);
    }
    //action buttons
    setTitle(title: string) {

        var _d = new Details("title", title);
        this.topBarEventSource.next(_d);
        try {
            browserConf.setTitle(title);
        } catch (e) {
            console.error(e);
        }
    }

    callActionButtonsEvent(evt: string) {
        this.actionButtonEventSource.next(evt);
    }


}