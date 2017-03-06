import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { goodAdd } from './add/add.comp';
import { goodView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule, AutoCompleteModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class goodreceiptComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: goodreceiptComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: goodAdd, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: goodAdd, canActivateChid: [AuthGuard], },
                    { path: 'view', component: goodView, canActivateChid: [AuthGuard], },
                    { path: '', component: goodView, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
        FormsModule, CommonModule, DataTableModule, AutoCompleteModule,NumTextModule],
    declarations: [
        goodAdd,
        goodView,
        goodreceiptComp
    ],
    providers: [AuthGuard]
})

export default class goodreceiptModule {
}