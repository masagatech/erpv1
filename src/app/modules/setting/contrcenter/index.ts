import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { contradd } from './add/add.comp';
import { contrview } from './view/contrview.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule, CheckboxModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class ContrComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: ContrComp,
        canActivate: [AuthGuard],
        data: { "module": "pset" },
        children: [
            {
                path: '',
                children: [

                    { path: 'add', component: contradd, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule": "cc", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: contradd, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule": "cc", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: contrview, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule": "cc", "rights": "view", "urlname": "/contrcenter" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule, DataTableModule, CheckboxModule],
    declarations: [
        contradd,
        contrview,
        ContrComp
    ],
    providers: [AuthGuard]
})

export default class ContrModule {
}