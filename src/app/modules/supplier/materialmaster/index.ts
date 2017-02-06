import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { materialAdd } from './add/add.comp';                //Purchase Add
import { materialView } from './view/view.comp';             //Purchase View

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, CheckboxModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class materialMasterComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: materialMasterComp,
        canActivate: [AuthGuard],
        data: { "module": "sup" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: materialAdd, canActivateChid: [AuthGuard], data: { "module": "sup", "submodule": "ma", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: materialAdd, canActivateChid: [AuthGuard], data: { "module": "sup", "submodule": "ma", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: materialView, canActivateChid: [AuthGuard], data: { "module": "sup", "submodule": "ma", "rights": "view", "urlname": "/material" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule, DataTableModule, CheckboxModule],
    declarations: [
        materialAdd,
        materialView,
        materialMasterComp
    ],
    providers: [AuthGuard]
})

export default class materialModule {
}