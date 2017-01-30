import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { invlocationAdd } from './add/add.comp';
import { invlocationView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class invlocationComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: invlocationComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: invlocationAdd, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: invlocationAdd, canActivateChid: [AuthGuard], },
                    { path: 'view', component: invlocationView, canActivateChid: [AuthGuard], },
                    { path: '', component: invlocationView, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule, DataTableModule],
    declarations: [
        invlocationAdd,
        invlocationView,
        invlocationComp
    ],
    providers: [AuthGuard]
})

export default class invlocationModule {
}