import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { dcADDEdit } from './add/aded.comp';
import { dcview } from './view/adedview.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class dcMasterComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: dcMasterComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [

                    //Bank Payment Add Edit View
                    { path: 'add', component: dcADDEdit, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: dcADDEdit, canActivateChid: [AuthGuard], },
                    { path: 'view', component: dcview, canActivateChid: [AuthGuard], },
                    { path: '', component: dcview, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule,
        CommonModule, DataTableModule, NumTextModule],
    declarations: [
        dcADDEdit,
        dcview,
        dcMasterComp
    ],
    providers: [AuthGuard]
})

export default class CustomerModule {
}