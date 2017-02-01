import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { WarehouseAdd } from './add/add.comp';                
import { WarehouseView } from './view/view.comp';             

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule,CheckboxModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class WarehouseComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: WarehouseComp,
        canActivate: [AuthGuard],
        data: { "module": "waresub" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: WarehouseAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "wm", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: WarehouseAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "wm", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: WarehouseView, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "wm", "rights": "view", "urlname": "/warehouse" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule,DataTableModule,CheckboxModule],
    declarations: [
        WarehouseAdd,
        WarehouseView,
        WarehouseComp
    ],
    providers: [AuthGuard]
})

export default class WarehouseModule {
}