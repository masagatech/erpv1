import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_service/authguard-service';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class UserSettingsModuleComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: UserSettingsModuleComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    //Bank Payment Add Edit View
                    {
                        path: 'defaultcompandfy', loadChildren: () => System.import('./def_cmpfy').then((comp: any) => {
                            return comp.default;
                        })
                    }
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
    declarations: [
        UserSettingsModuleComp
    ],
    providers: [AuthGuard]
})

export default class UserSettingsModule {

}