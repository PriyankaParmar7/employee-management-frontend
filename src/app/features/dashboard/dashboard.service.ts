
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface EmployeeCountResponse {
  totalEmployees: number;
}

export interface DepartmentCountResponse {
  totalDepartments: number;
}

export interface TeamCountResponse {
  totalTeams: number;
}


export interface Department {
  id: number;
  name: string;
  description: string;
  totalEmployees: number;
  totalTeams: number;
  isActive: boolean;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  team: string;
  designation: string;
  supervisor: string;
  isActive: boolean;
}

export interface EmployeeSearchRequest {
  page: number;
  pageSize: number;
  search: string;
  status: string | null;
  departmentId: number | null;
  teamId: number | null;
  designationId: number | null;
  supervisorId: number | null;
  sortBy: string;
  sortDescending: boolean;
}

export interface EmployeeSearchResponse {
  employees: Employee[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface PendingLeave {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: string;
  isTeamLeave: boolean;
  teamId: number;
  teamName: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/api/Employee/count`;

  constructor(private http: HttpClient) {}

  getEmployeeCount(): Observable<EmployeeCountResponse> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<EmployeeCountResponse>(
      this.apiUrl,
      { headers }
    );
  }

  getDepartmentCount(): Observable<DepartmentCountResponse> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<DepartmentCountResponse>(
    `${environment.apiUrl}/api/Department/count`,
    { headers }
  );
}

getTeamCount(): Observable<TeamCountResponse> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<TeamCountResponse>(
    `${environment.apiUrl}/api/Team/count`,
    { headers }
  );
}

getPendingLeaves(): Observable<PendingLeave[]>  {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<any[]>(
    `${environment.apiUrl}/api/Leave/pending`,
    { headers }
  );
}


getDepartments(): Observable<Department[]> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<Department[]>(
    `${environment.apiUrl}/api/Department`,
    { headers }
  );}

  searchEmployees(
  request: EmployeeSearchRequest
): Observable<EmployeeSearchResponse> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.post<EmployeeSearchResponse>(
    `${environment.apiUrl}/api/Employee/search`,
    request,
    { headers }
  );
}


  

}
