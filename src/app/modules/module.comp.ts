import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel, Event as NavigationEvent } from '@angular/router';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { ActionBtnProp, Details } from '../../app/_model/action_buttons'
import { SharedVariableService } from "../_service/sharedvariable-service";
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: 'module.comp.html',
})

export class ModuleComponent implements OnDestroy {
    subscription: Subscription;
    ActionButtons: ActionBtnProp[] = [];
    eventActDetails: Details;
    title: string = "";
    constructor(router: Router, private slimLoadingBarService: SlimLoadingBarService,
        private setActionButtons: SharedVariableService) {

        router.events.forEach((event: NavigationEvent) => {
            if (event instanceof NavigationStart) {
                // console.log("nav start");
                //this.ActionButtons = [];
                this.setActionButtons.setTitle(".....");
                this.slimLoadingBarService.progress = 30;
                this.slimLoadingBarService.start(() => {
                    //console.log('Loading complete');
                });
            }

            if (event instanceof NavigationEnd) {
                this.slimLoadingBarService.complete();
            }

            if (event instanceof NavigationError) {
                this.slimLoadingBarService.complete();
            }

            if (event instanceof NavigationCancel) {
                this.slimLoadingBarService.complete();
            }
        });

        this.subscription = this.setActionButtons.topBarSettingsEvent$.subscribe(detail => {
            //this.ActionButtons = actionButtons
            switch (detail.type) {
                case "title": {
                    this.title = detail.details;
                }
                    break;
                case "buttons": {
                    this.ActionButtons = detail.details;
                }
                    break;
            }
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}