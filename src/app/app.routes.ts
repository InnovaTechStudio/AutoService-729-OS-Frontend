import { Routes } from '@angular/router';
import { LoginComponent } from './domains/auth/presentation/login/login.component';
import { AdminLayoutComponent } from './shared/presentation/admin-layout/admin-layout.component';
import { DashboardComponent } from './domains/workshop-operations/presentation/dashboard/dashboard.component';
import { CustomerListComponent } from './domains/customer-management/presentation/customer-list/customer-list';
import { VehicleListComponent } from './domains/fleet-management/presentation/vehicle-list/vehicle-list';
import { MechanicsViewComponent } from './domains/staff-coordination/presentation/mechanics-view/mechanics-view';
import {TasksViewComponent} from './domains/workshop-operations/presentation/tasks-view/tasks-view';
import { WorkOrderListComponent } from './domains/workshop-operations/presentation/work-order-list/work-order-list';
import { CreateWorkOrderComponent } from './domains/workshop-operations/presentation/create-work-order/create-work-order';
import { WorkOrderDetailComponent } from './domains/workshop-operations/presentation/work-order-detail/work-order-detail';
import {TrackingViewComponent} from './domains/customer-trust/presentation/tracking-view/tracking-view';
import { VehicleDetailComponent } from './domains/fleet-management/presentation/vehicle-detail/vehicle-detail';



export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'tracking', component: TrackingViewComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'customers', component: CustomerListComponent },
      { path: 'vehicles', component: VehicleListComponent },
      { path: 'vehicles/:id', component: VehicleDetailComponent },
      { path: 'mechanics', component: MechanicsViewComponent },
      { path: 'tasks', component: TasksViewComponent },
      { path: 'work-orders', component: WorkOrderListComponent },
      { path: 'work-orders/new', component: CreateWorkOrderComponent },
      { path: 'work-orders/:id', component: WorkOrderDetailComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
