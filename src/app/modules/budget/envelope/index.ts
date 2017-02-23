import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddEnvelopeComp } from './aded/addbdenv.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';
import { GroupByPipe } from '../../../_pipe/groupby.pipe';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class EnvelopeComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: EnvelopeComp,
        canActivate: [AuthGuard],
        data: { "module": "bdg" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: AddEnvelopeComp, canActivateChid: [AuthGuard],  data: { "module": "bdg", "submodule":"bdenv", "rights": "add", "urlname": "" }},
                    { path: 'edit/:id', component: AddEnvelopeComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdenv", "rights": "edit", "urlname": "/edit" } },
                    { path: 'details/:id', component: AddEnvelopeComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdenv", "rights": "edit", "urlname": "/edit" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataTableModule, CalendarModule, NumTextModule],
    declarations: [
        AddEnvelopeComp,
        EnvelopeComp,
        GroupByPipe
    ],
    providers: [AuthGuard]
})

export default class EnvelopeModule {
}