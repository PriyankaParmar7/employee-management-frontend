import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DashboardService,
  Department,
  Designation,
  Team,
  Employee,
  CreateEmployeeRequest
} from '../../dashboard/dashboard.service';

export interface SystemRoleOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-create-employee-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-employee-modal.html',
  styleUrl: './create-employee-modal.css'
})
export class CreateEmployeeModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() departments: Department[] = [];
  @Input() designations: Designation[] = [];
  @Input() supervisors: Employee[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() employeeCreated = new EventEmitter<void>();

  // Available roles matching the backend (1: Admin, 2: HR, 3: Employee)
  roles: SystemRoleOption[] = [
    { id: 3, label: 'Employee (Standard Access)' },
    { id: 2, label: 'HR' },
    { id: 1, label: 'Admin' }
  ];

  // Teams filtered by the selected department in the modal
  departmentTeams: Team[] = [];

  // Form Fields
  fullName = '';
  username = '';
  email = '';
  roleId: number = 3; // Default matches reference: Employee (Standard Access)
  departmentId: number | null = null;
  teamId: number | null = null;
  designationId: number | null = null;
  supervisorId: number | null = null;

  // State management
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
    }
  }

  // When user selects a Department in the modal, load the corresponding teams
  onDepartmentChange(deptId: number | null): void {
    this.departmentId = deptId;
    this.teamId = null;
    this.departmentTeams = [];

    if (deptId !== null) {
      this.dashboardService.getTeamsByDepartment(deptId).subscribe({
        next: (teams) => {
          this.departmentTeams = teams.filter((t) => t.isActive);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load teams for department:', err);
          this.cdr.markForCheck();
        }
      });
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Validation for required fields
    if (!this.fullName.trim()) {
      this.errorMessage = 'Full Name is required.';
      return;
    }
    if (!this.username.trim()) {
      this.errorMessage = 'Username is required.';
      return;
    }
    if (!this.email.trim()) {
      this.errorMessage = 'Email Address is required.';
      return;
    }
    if (!this.roleId) {
      this.errorMessage = 'System Role is required.';
      return;
    }
    if (!this.designationId) {
      this.errorMessage = 'Designation is required.';
      return;
    }

    const payload: CreateEmployeeRequest = {
      name: this.fullName.trim(),
      username: this.username.trim(),
      email: this.email.trim(),
      roleId: Number(this.roleId),
      departmentId: this.departmentId ? Number(this.departmentId) : null,
      teamId: this.teamId ? Number(this.teamId) : null,
      designationId: Number(this.designationId),
      supervisorId: this.supervisorId ? Number(this.supervisorId) : null
    };

    this.isSubmitting = true;

    this.dashboardService.createEmployee(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.resetForm();
        this.employeeCreated.emit();
        this.close.emit();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Failed to create employee:', error);
        if (typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to create employee. Please check your inputs.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  onClose(): void {
    if (!this.isSubmitting) {
      this.resetForm();
      this.close.emit();
    }
  }

  resetForm(): void {
    this.fullName = '';
    this.username = '';
    this.email = '';
    this.roleId = 3;
    this.departmentId = null;
    this.teamId = null;
    this.designationId = null;
    this.supervisorId = null;
    this.departmentTeams = [];
    this.errorMessage = '';
    this.isSubmitting = false;
  }
}
