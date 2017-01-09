import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
//import { AddrbookComp } from '../../usercontrol/addressbook/adrbook.comp';

import { VenAdd } from './add/add.comp';
import { VenView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

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
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: VenAdd, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: VenAdd, canActivateChid: [AuthGuard], },
                    { path: 'view', component: VenView, canActivateChid: [AuthGuard], },
                    { path: '', component: VenView, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule, DataTableModule],
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