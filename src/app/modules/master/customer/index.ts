import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { CustAdd } from './add/add.comp';
import { CustView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddDynamicTabModule } from '../../usercontrol/adddynamictab';
import { DynamicTabModule } from '../../usercontrol/dynamictab';
import { LazyLoadEvent, DataTableModule, CheckboxModule,AccordionModule,AutoCompleteModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

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
        data: { "module": "coa" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: CustAdd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "cm", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: CustAdd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "cm", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: CustView, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "cm", "rights": "view", "urlname": "/customer" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule,
    CommonModule, DataTableModule, CheckboxModule,AddDynamicTabModule,DynamicTabModule,
    AccordionModule,AutoCompleteModule,NumTextModule],
    declarations: [
        CustAdd,
        CustView,
        //AddrbookComp,
        CustomerComp
    ],
    providers: [AuthGuard]
})

export default class CustomerModule {
}