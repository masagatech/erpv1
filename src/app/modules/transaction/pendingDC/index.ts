import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { pendingdc } from '../pendingDC/pendingdc.comp';
import { CalendarModule } from '../../usercontrol/calendar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class PendingdcComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: PendingdcComp,
        canActivate: [AuthGuard],
        data: { "module": "dcm" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: pendingdc, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "pso", "rights": "view", "urlname": "/pendingdc" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
        FormsModule, CommonModule, DataTableModule, CalendarModule,NumTextModule],
    declarations: [
        pendingdc,
        PendingdcComp
    ],
    providers: [AuthGuard]
})

export default class PendingdcModule {
}