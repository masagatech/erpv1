import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../_service/auth-service'
import { UserService } from '../../../_service/user/user-service'
import { ArrayFilterPipe } from '../../../_util/filter'
import { Router } from '@angular/router';

declare var $: any;


@Component({
  selector: '<app-head></app-head>',
  templateUrl: 'header.comp.html'
})
export class UserControlHeadComp implements OnInit {
  //$('.dropdown-submenu > a').submenupicker();

  menuhead: any;
  parentMenus: any;
  subMenu: any;
  loginUser: any;
  loginUserName: string;
  constructor(private _authservice: AuthenticationService, private _userService: UserService, private _router: Router) {

    //alert( $('.dropdown-submenu > a'))//.submenupicker();
    //get login user details 
    this.loginUser = this._userService.getUser();
    if (this.loginUser == null) {
      return;
    }
    //set user name 
    this.loginUserName = this.loginUser.usrnm;
    //get menues according to loggedin user
    this._userService.getMenuHead({ "userid": this.loginUser.uid }).subscribe(data => {
      var data1 = JSON.parse(data.mainmenu);
      this.subMenu = data1.Table2;
      this.parentMenus = data1.Table1;
      this.menuhead = data1.Table;
      for (var i = 0; i <= this.menuhead.length - 1; i++) {
        //console.log(this.menuhead[i]["mid"]);
        var _parentMenu = this.parentMenus.filter(item => item.mid === this.menuhead[i].mid);
        for (var j = 0; j <= _parentMenu.length - 1; j++) {
          _parentMenu[j].subsub = this.subMenu.filter(subitem => subitem.parentid === _parentMenu[j].parentid);
        }
        this.menuhead[i].sub = _parentMenu;
        //console.log(_parentMenu);
        // this.menuhead[i].sub = this.parentMenus.filter(item => item.parentid === this.menuhead[i].mid);
        $('.dropdown-submenu > a').submenupicker();
      }

    }, err => {

    }, () => {
      // console.log("Complete");
    })



  }

  callRoute(item: any, click: any) {
    if (click === 0) {

      var link = item.menulink.toString();
      this._router.navigate([link]);
    }

  }

  ngOnInit() {

  }

  logout() {
    this._authservice.logout();
  }

}


