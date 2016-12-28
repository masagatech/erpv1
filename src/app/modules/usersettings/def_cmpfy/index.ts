import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { DefCmpFyComp } from './code/defcmpfy.comp';     //Bank Payment
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class DefCompFyModuleComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: DefCompFyModuleComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    //Bank Payment Add Edit View
                    { path: '', component: DefCmpFyComp, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
    declarations: [
        DefCompFyModuleComp,
        DefCmpFyComp
    ],
    providers: [AuthGuard]
})

export default class DefCompFyModule {

}