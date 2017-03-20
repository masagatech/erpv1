import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ActionBtnProp, Details, Evt } from '../../app/_model/action_buttons'
import { LoginUser } from '../../app/_model/user_model'

declare var browserConf: any;
declare var $: any;


@Injectable()
export class SharedVariableService {


    constructor() {

    }



    // Observable string sources
    private actionButtonSource = new Subject<ActionBtnProp[]>();
    private topBarEventSource = new Subject<Details>();

    private actionButtonEventSource = new Subject<String>();
    private actionButtonEventSource_extra = new Subject<Evt>();

    // Observable string streams
    public setActionButtons$ = this.actionButtonSource.asObservable();
    public topBarSettingsEvent$ = this.topBarEventSource.asObservable();
    public setActionButtonsEvent$ = this.actionButtonEventSource.asObservable();
    public setActionButtonsEvent_Extra$ = this.actionButtonEventSource_extra.asObservable();
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

    showSideMenu() {
        $('#sidebar').show();
        $('.container').removeClass('closeopenpan');
    }

    hideSideMenu() {
        $('#sidebar').hide();
        $('.container').addClass('closeopenpan');
    }


    callActionButtonsEvent(evt: string) {
        this.actionButtonEventSource.next(evt);
    }

    callActionButtonsEvent_extra(evt: string, $event?: any) {
        this.actionButtonEventSource_extra.next(new Evt(evt, $event));
    }




}