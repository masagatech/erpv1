import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { VenAdd } from './add/add.comp';
import { VenView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, CheckboxModule,AutoCompleteModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class VendorComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: VendorComp,
        canActivate: [AuthGuard],
        data: { "module": "coa" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: VenAdd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "vm", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: VenAdd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "vm", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: VenView, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "vm", "rights": "view", "urlname": "/vendor" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule,
     CommonModule, DataTableModule, CheckboxModule,AutoCompleteModule,NumTextModule],
    declarations: [
        VenAdd,
        VenView,
        //AddrbookComp,
        VendorComp
    ],
    providers: [AuthGuard]
})

export default class VendorModule {
}