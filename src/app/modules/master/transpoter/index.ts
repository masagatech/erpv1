import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { transadd } from './add/add.comp';
import { transview } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class TranspoterComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: TranspoterComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: transadd, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: transadd, canActivateChid: [AuthGuard], },
                    { path: 'view', component: transview, canActivateChid: [AuthGuard], },
                    { path: '', component: transview, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule, DataTableModule],
    declarations: [
        transadd,
        transview,
        TranspoterComp
    ],
    providers: [AuthGuard]
})

export default class TranspoterModule {
}