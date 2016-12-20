import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';
import { LoginComp } from './login/login.comp'
import { LoginStep1Comp } from './login/login-step1.comp'

export const ROUTES: Routes = [
  { path: 'login', component: LoginComp },
  { path: 'login-step1', component: LoginStep1Comp },
  {
    path: 'changepwd', loadChildren: () => System.import('./login/changepwd').then((comp: any) => {
      return comp.default;
    })
    ,
  },
  {
    path: '', loadChildren: () => System.import('./modules').then((comp: any) => {
      return comp.default;
    })
    ,
  },
  { path: '**', component: NoContentComponent },
];
