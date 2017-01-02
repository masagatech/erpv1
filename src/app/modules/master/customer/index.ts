import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { AddrbookComp } from '../../usercontrol/addressbook/adrbook.comp';

import { CustAdd } from './add/add.comp';                //Purchase Add
import { CustView } from './view/view.comp';             //Purchase View

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class CustomerComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: CustomerComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [

                    //Bank Payment Add Edit View
                    { path: 'add', component: CustAdd, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: CustAdd, canActivateChid: [AuthGuard], },
                    { path: 'view', component: CustView, canActivateChid: [AuthGuard], },
                    { path: '', component: CustView, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule,DataTableModule],
    declarations: [
        CustAdd,
        CustView,
        AddrbookComp,
        CustomerComp
    ],
    providers: [AuthGuard]
})

export default class CustomerModule {
}