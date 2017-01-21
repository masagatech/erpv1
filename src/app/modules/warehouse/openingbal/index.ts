import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { WareopebalAdd } from './add/add.comp';                
import { WareopebalView } from './view/view.comp';             

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class WarehouseOpeComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: WarehouseOpeComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: WareopebalAdd, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: WareopebalAdd, canActivateChid: [AuthGuard], },
                    { path: 'view', component: WareopebalView, canActivateChid: [AuthGuard], },
                    { path: '', component: WareopebalView, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule,DataTableModule],
    declarations: [
        WareopebalAdd,
        WareopebalView,
        WarehouseOpeComp
    ],
    providers: [AuthGuard]
})

export default class WarehouseOpenModule {
}