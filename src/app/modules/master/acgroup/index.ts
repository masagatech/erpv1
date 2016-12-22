import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { acadd } from './add/add.comp';                //Purchase Add
import { acview } from './view/view.comp';             //Purchase View

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class AcGrouptComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: AcGrouptComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [

                    //Bank Payment Add Edit View
                    { path: 'acadd', component: acadd, canActivateChid: [AuthGuard], },
                    { path: 'acedit/:id', component: acadd, canActivateChid: [AuthGuard], },
                    { path: 'acview', component: acview, canActivateChid: [AuthGuard], },
                    { path: '', component: acview, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
    declarations: [
        acadd,
        acview,
        AcGrouptComp
    ],
    providers: [AuthGuard]
})

export default class AcGrouptModule {
}