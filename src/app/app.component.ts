/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { MessageService } from "./_service/messages/message-service";
import { Message } from 'primeng/primeng';
import { AppState } from './app.service';
import { Subscription } from 'rxjs/Subscription';

/*
 * App Component
 * Top Level Component
 */

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [],
  template: `<router-outlet></router-outlet>
   <p-growl [class]="'zin2000'" [value]="messagestack"></p-growl>`
})

export class AppComponent {
  angularclassLogo = 'assets/img/angularclass-avatar.png';
  name = 'Angular 2 Webpack Starter';
  url = 'https://twitter.com/AngularClass';
  subscription: Subscription;
  messagestack: Message[] = [];


  constructor(public appState: AppState, _messageServ: MessageService) {
    this.subscription = _messageServ.notificationReceiver$.subscribe(_messagestack => {
      this.messagestack.push({
        severity: _messagestack.severity, detail: _messagestack.detail, summary: _messagestack.summary
      });
    });
  }

  ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }

}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
