import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_service/authguard-service';
import { UserService } from '../../_service/user/user-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../_service/auth-service'
import { LoginUserModel } from '../../_model/user_model'
import { Router } from '@angular/router';
@Component({
    template: '<router-outlet></router-outlet>'
})

export class ChangePwdModuleComp {
    constructor() {
    }
}



@Component({
    templateUrl: './changepwd.comp.html'
})

export class ChangePwdComp implements OnInit {
    loginuser: LoginUserModel;
    newpwd: string = "";
    renewpwd: string = "";
    constructor(private _authservice: AuthenticationService, private _userservice: UserService, private _router: Router, ) {
        this.loginuser = _userservice.getUser();
    }


    ngOnInit() {
    }
    private next_click(e) {
        this._userservice.savePassword({ "uid": this.loginuser.uid, "pwd": this.newpwd }).subscribe(d => {
            var da = d.data[0];
            if (da.status) {
                this._router.navigate(['/usersettings/defaultcompandfy']);
            } else {

            }



        }, err => {


        },
            () => {

            });
    }
    private logout() {
        this._authservice.logout();
    }
}

const routerConfig = [
    {
        path: '',
        component: ChangePwdModuleComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: '', component: ChangePwdComp, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule],
    declarations: [
        ChangePwdModuleComp,
        ChangePwdComp
    ],
    providers: [AuthGuard]
})

export default class ChangePwdModule {
}