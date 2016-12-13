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
            "uid": this.loginUser.uid,
            "ptype": this.menuid,
            "flag": "menu"
        }).subscribe(data => {
            var data1 = data.data;
            this.submenulist = data1;
        }, err => {

        }, () => {

        })
    }

    ngOnDestroy() {
        console.log('Destroy');
    }
}