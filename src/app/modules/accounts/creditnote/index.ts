import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddCreditNote } from './aded/addcn.comp';
import { ViewCreditNote } from './view/viewcn.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, DataListModule, CheckboxModule, AutoCompleteModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class CreditNoteComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: CreditNoteComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddCreditNote, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "cn", "rights": "add", "urlname": "/add" } },
                    { path: 'details/:id', component: AddCreditNote, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "cn", "rights": "edit", "urlname": "/details" } },
                    { path: 'edit/:id', component: AddCreditNote, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "cn", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewCreditNote, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "cn", "rights": "view", "urlname": "/creditnote" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, DataListModule, AutoCompleteModule, CheckboxModule, CalendarModule, NumTextModule],
    declarations: [
        AddCreditNote,
        ViewCreditNote,
        CreditNoteComp
    ],
    providers: [AuthGuard]
})

export default class CreditNoteModule {
}