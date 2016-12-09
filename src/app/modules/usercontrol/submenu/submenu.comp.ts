import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { UserService } from '../../../_service/user/user-service'  //Get UserName 

@Component({
    selector: '<submenu></submenu>',
    templateUrl: 'submenu.comp.html'
})

export class SubMenuComponent implements OnInit, OnDestroy {
    submenulist: any;
    loginUser: any;

    @Input() menuid: string;

    constructor(private _userService: UserService) {
    }

    ngOnInit() {
        this.loginUser = this._userService.getUser();
        if (this.loginUser == null) {
            return;
        }
      
        this._userService.getSubMenu({
            "userid": this.loginUser.uid,
            "parentid": this.menuid,
            "Flag": "menu"
        }).subscribe(data => {
            var data1 = JSON.parse(data.mainmenu);
            this.submenulist = data1.Table;
        }, err => {

        }, () => {

        })
    }

    ngOnDestroy() {
        console.log('Destroy');
    }
}