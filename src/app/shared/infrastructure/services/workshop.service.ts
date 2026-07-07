import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CurrentWorkshop {
  tenantId: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class WorkshopService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1`;

  getCurrentWorkshop(): Observable<CurrentWorkshop> {
    return this.http.get<CurrentWorkshop>(`${this.apiUrl}/workshops/me`);
  }
}
