import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { itemadd } from './add/itemadd.comp';                            //item Add
import { itemview } from './view/itemview.comp';                         //item View


import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class ItemsMasterComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: ItemsMasterComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [

                    //Bank Payment Add Edit View
                    { path: 'itemadd', component: itemadd, canActivateChid: [AuthGuard], },
                    { path: 'itemedit/:id', component: itemadd, canActivateChid: [AuthGuard], },
                    { path: 'itemview', component: itemview, canActivateChid: [AuthGuard], },
                    { path: '', component: itemview, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
    declarations: [
        itemadd,
        itemview,
        ItemsMasterComp
    ],
    providers: [AuthGuard]
})

export default class ItemsMasterModule {
}