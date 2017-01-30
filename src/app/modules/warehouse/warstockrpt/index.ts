import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
               
import { warstockrpt } from './view/view.comp';             

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class warstockrptComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: warstockrptComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'view', component: warstockrpt, canActivateChid: [AuthGuard], },
                    { path: '', component: warstockrpt, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule,DataTableModule],
    declarations: [
        warstockrpt,
        warstockrptComp
    ],
    providers: [AuthGuard]
})

export default class warstockrptModule {
}