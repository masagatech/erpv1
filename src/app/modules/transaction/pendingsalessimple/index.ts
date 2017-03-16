import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { pendingsalessimple } from '../pendingsalessimple/view.comp';
import { CalendarModule } from '../../usercontrol/calendar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, AutoCompleteModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class PendingSalesSimpleComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: PendingSalesSimpleComp,
        canActivate: [AuthGuard],
        data: { "module": "dcm" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: pendingsalessimple, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "pords", "rights": "view", "urlname": "/penordsample" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
        FormsModule, CommonModule, DataTableModule, AutoCompleteModule, CalendarModule, NumTextModule],
    declarations: [
        pendingsalessimple,
        PendingSalesSimpleComp
    ],
    providers: [AuthGuard]
})

export default class PendingSalesSimpleModule {
}