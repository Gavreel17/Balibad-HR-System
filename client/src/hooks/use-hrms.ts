import { useQuery, useMutation } from "@tanstack/react-query";
import { db, User, Attendance, Document, ActivityLog, CashAdvanceRequest, SystemSettings } from "@/lib/db";
import { queryClient } from "@/lib/queryClient";

export function useUsers() {
    return useQuery<User[]>({
        queryKey: ["/api/users"],
    });
}

export function useAttendance() {
    return useQuery<Attendance[]>({
        queryKey: ["/api/attendance"],
    });
}


export function useDocuments() {
    return useQuery<Document[]>({
        queryKey: ["/api/documents"],
    });
}

export function useCashAdvances() {
    return useQuery<CashAdvanceRequest[]>({
        queryKey: ["/api/cash-advances"],
    });
}

export function useActivityLogs() {
    return useQuery<ActivityLog[]>({
        queryKey: ["/api/activity-logs"],
    });
}

export function useSettings() {
    return useQuery<SystemSettings>({
        queryKey: ["/api/settings"],
    });
}

export function useHRMSMutations() {
    const addUser = useMutation({
        mutationFn: (user: Partial<User>) => db.addUser(user),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/users"] }),
    });

    const updateUser = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => db.updateUser(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            // Update local storage if current user was updated
            const currentUser = db.getCurrentUser();
            if (currentUser && currentUser.id === variables.id) {
                const updated = { ...currentUser, ...variables.data };
                db.setCurrentUser(updated);
            }
        },
    });

    const deleteUser = useMutation({
        mutationFn: (id: string) => db.deleteUser(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/users"] }),
    });

    const addAttendance = useMutation({
        mutationFn: (record: Partial<Attendance>) => db.addAttendance(record),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/attendance"] }),
    });

    const updateAttendance = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Attendance> }) => db.updateAttendance(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/attendance"] }),
    });

    const addActivity = useMutation({
        mutationFn: (activity: Partial<ActivityLog>) => db.addActivity(activity),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] }),
    });

    const updateSettings = useMutation({
        mutationFn: (data: Partial<SystemSettings>) => db.updateSystemSettings(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/settings"] }),
    });

    const addDocument = useMutation({

        mutationFn: (doc: Partial<Document>) => db.addDocument(doc),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/documents"] }),
    });

    const deleteDocument = useMutation({
        mutationFn: (id: string) => db.deleteDocument(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/documents"] }),
    });

    const addCashAdvance = useMutation({

        mutationFn: (request: Partial<CashAdvanceRequest>) => db.addCashAdvanceRequest(request),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cash-advances"] }),
    });

    const updateCashAdvanceStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => db.updateCashAdvanceStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cash-advances"] }),
    });

    const deleteCashAdvance = useMutation({
        mutationFn: (id: string) => db.deleteCashAdvanceRequest(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cash-advances"] }),
    });

    return {
        addUser, updateUser, deleteUser,
        addAttendance, updateAttendance,
        addActivity, updateSettings,
        addDocument, deleteDocument,
        addCashAdvance, updateCashAdvanceStatus, deleteCashAdvance
    };
}
