
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
    UpdateEmployeeRequest
} from '../../dashboard/dashboard.service';

@Component({
    selector: 'app-edit-employee-model',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './edit-employee-model.html',
    styleUrl: './edit-employee-model.css'
})
export class EditEmployeeModelComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() employee: Employee | null = null;
    @Input() departments: Department[] = [];
    @Input() designations: Designation[] = [];
    @Input() supervisors: Employee[] = [];

    @Output() close = new EventEmitter<void>();
    @Output() employeeUpdated = new EventEmitter<void>();

    departmentTeams: Team[] = [];

    // Form Fields
    fullName = '';
    email = '';
    departmentId: number | null = null;
    teamId: number | null = null;
    designationId: number | null = null;
    supervisorId: number | null = null;

    isSubmitting = false;
    errorMessage = '';

    constructor(
        private dashboardService: DashboardService,
        private cdr: ChangeDetectorRef
    ) { }

    // Employee khud ka supervisor nahi ho sakta
    get availableSupervisors(): Employee[] {
        if (!this.employee) return this.supervisors;
        return this.supervisors.filter((s) => s.id !== this.employee?.id);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['isOpen'] || changes['employee']) && this.isOpen && this.employee) {
            this.populateForm();
        }
    }

    // Pre-fill form values with current employee data
    populateForm(): void {
        if (!this.employee) return;

        this.errorMessage = '';
        this.isSubmitting = false;
        this.fullName = this.employee.name || '';
        this.email = this.employee.email || '';

        // Match Department by Name
        const matchedDept = this.departments.find(
            (d) => d.name.toLowerCase() === this.employee?.department?.toLowerCase()
        );
        this.departmentId = matchedDept ? matchedDept.id : null;

        // Match Designation by Name
        const matchedDesig = this.designations.find(
            (d) => d.name.toLowerCase() === this.employee?.designation?.toLowerCase()
        );
        this.designationId = matchedDesig ? matchedDesig.id : null;

        // Match Supervisor by Name
        const matchedSupervisor = this.supervisors.find(
            (s) => s.name.toLowerCase() === this.employee?.supervisor?.toLowerCase()
        );
        this.supervisorId = matchedSupervisor ? matchedSupervisor.id : null;

        // Load teams for matched department and select current team
        if (this.departmentId !== null) {
            this.loadTeamsForDepartment(this.departmentId, this.employee.team);
        } else {
            this.departmentTeams = [];
            this.teamId = null;
        }

        this.cdr.markForCheck();
    }

    onDepartmentChange(deptId: number | null): void {
        this.departmentId = deptId;
        this.teamId = null;
        this.departmentTeams = [];

        if (deptId !== null) {
            this.loadTeamsForDepartment(deptId);
        }
    }

    private loadTeamsForDepartment(deptId: number, currentTeamName?: string): void {
        this.dashboardService.getTeamsByDepartment(deptId).subscribe({
            next: (teams) => {
                this.departmentTeams = teams.filter((t) => t.isActive);

                if (currentTeamName) {
                    const matchedTeam = this.departmentTeams.find(
                        (t) => t.name.toLowerCase() === currentTeamName.toLowerCase()
                    );
                    this.teamId = matchedTeam ? matchedTeam.id : null;
                }

                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load teams for department:', err);
                this.cdr.markForCheck();
            }
        });
    }

    onSubmit(): void {
        if (!this.employee) return;

        this.errorMessage = '';

        if (!this.fullName.trim()) {
            this.errorMessage = 'Full Name is required.';
            return;
        }
        if (!this.email.trim()) {
            this.errorMessage = 'Email Address is required.';
            return;
        }
        if (!this.designationId) {
            this.errorMessage = 'Designation is required.';
            return;
        }

        const payload: UpdateEmployeeRequest = {
            name: this.fullName.trim(),
            email: this.email.trim(),
            departmentId: this.departmentId ? Number(this.departmentId) : null,
            teamId: this.teamId ? Number(this.teamId) : null,
            designationId: Number(this.designationId),
            supervisorId: this.supervisorId ? Number(this.supervisorId) : null
        };

        this.isSubmitting = true;

        this.dashboardService.updateEmployee(this.employee.id, payload).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.employeeUpdated.emit();
                this.close.emit();
            },
            error: (error) => {
                this.isSubmitting = false;
                console.error('Failed to update employee:', error);
                if (typeof error.error === 'string') {
                    this.errorMessage = error.error;
                } else if (error.error?.message) {
                    this.errorMessage = error.error.message;
                } else if (error.error?.errors) {
                    const firstKey = Object.keys(error.error.errors)[0];
                    this.errorMessage = error.error.errors[firstKey][0];
                } else {
                    this.errorMessage = 'Failed to update employee. Please check your inputs.';
                }
                this.cdr.markForCheck();
            }
        });
    }

    onClose(): void {
        if (!this.isSubmitting) {
            this.close.emit();
        }
    }
}