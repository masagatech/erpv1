import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { WarehouseAdd } from './add/add.comp';
import { WarehouseView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NumTextModule } from '../../usercontrol/numtext';
import { NumLabelModule } from '../../usercontrol/numlabel';

import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class WarehousestockComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: WarehousestockComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: WarehouseAdd, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: WarehouseAdd, canActivateChid: [AuthGuard], },
                    { path: 'view', component: WarehouseView, canActivateChid: [AuthGuard], },
                    { path: '', component: WarehouseView, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule,
        CommonModule, DataTableModule, NumTextModule, NumLabelModule],
    declarations: [
        WarehouseAdd,
        WarehouseView,
        WarehousestockComp
    ],
    providers: [AuthGuard]
})

export default class WarehousestockModule {
}