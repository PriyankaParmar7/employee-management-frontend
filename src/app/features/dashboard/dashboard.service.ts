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

export interface DesignationCountResponse {
  totalDesignations: number;
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

export interface Team {
  id: number;
  name: string;
  employeeCount: number;
  teamHead: string;
  isActive: boolean;
}

export interface Designation {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  employeeCount: number;
}

export interface CreateEmployeeRequest {
  username: string;
  email: string;
  name: string;
  roleId: number;
  departmentId: number | null;
  teamId: number | null;
  supervisorId: number | null;
  designationId: number;
}

export interface UpdateEmployeeRequest {
  name: string;
  email: string;
  departmentId: number | null;
  teamId: number | null;
  designationId: number;
  supervisorId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getEmployeeCount(): Observable<EmployeeCountResponse> {
    return this.http.get<EmployeeCountResponse>(
      `${this.baseUrl}/api/Employee/count`,
      this.getAuthHeaders()
    );
  }

  getDepartmentCount(): Observable<DepartmentCountResponse> {
    return this.http.get<DepartmentCountResponse>(
      `${this.baseUrl}/api/Department/count`,
      this.getAuthHeaders()
    );
  }

  getDesignationCount(): Observable<DesignationCountResponse> {
    return this.http.get<DesignationCountResponse>(
      `${this.baseUrl}/api/Designation/count`,
      this.getAuthHeaders()
    );
  }

  getTeamCount(): Observable<TeamCountResponse> {
    return this.http.get<TeamCountResponse>(
      `${this.baseUrl}/api/Team/count`,
      this.getAuthHeaders()
    );
  }

  getPendingLeaves(): Observable<PendingLeave[]> {
    return this.http.get<PendingLeave[]>(
      `${this.baseUrl}/api/Leave/pending`,
      this.getAuthHeaders()
    );
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(
      `${this.baseUrl}/api/Department`,
      this.getAuthHeaders()
    );
  }

  searchEmployees(request: EmployeeSearchRequest): Observable<EmployeeSearchResponse> {
    return this.http.post<EmployeeSearchResponse>(
      `${this.baseUrl}/api/Employee/search`,
      request,
      this.getAuthHeaders()
    );
  }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(
      `${this.baseUrl}/api/Team`,
      this.getAuthHeaders()
    );
  }

  getTeamsByDepartment(departmentId: number): Observable<Team[]> {
    return this.http.get<Team[]>(
      `${this.baseUrl}/api/Department/${departmentId}/teams`,
      this.getAuthHeaders()
    );
  }

  getDesignations(): Observable<Designation[]> {
    return this.http.get<Designation[]>(
      `${this.baseUrl}/api/Designation`,
      this.getAuthHeaders()
    );
  }

  createEmployee(request: CreateEmployeeRequest): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(
      `${this.baseUrl}/api/Employee`,
      request,
      { headers, responseType: 'text' }
    );
  }

  updateEmployeeStatus(id: number, isActive: boolean): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put(
      `${this.baseUrl}/api/Employee/${id}/status`,
      { isActive },
      { headers, responseType: 'text' }
    );
  }

  deleteEmployee(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete(
      `${this.baseUrl}/api/Employee/${id}`,
      { headers, responseType: 'text' }
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(
      `${this.baseUrl}/api/Employee/${id}`,
      this.getAuthHeaders()
    );
  }

  updateEmployee(id: number, request: UpdateEmployeeRequest): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put(
      `${this.baseUrl}/api/Employee/${id}`,
      request,
      { headers, responseType: 'text' }
    );
  }
}