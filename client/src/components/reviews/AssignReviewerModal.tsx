import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { assignReviewerApi } from "@/api/proposal.api";
import { getUsersApi } from "@/api/user.api";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Proposal } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AssignReviewerModalProps {
    proposal: Proposal;
    open: boolean;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AssignReviewerModal = ({
    proposal,
    open,
    onClose,
}: AssignReviewerModalProps) => {
    const queryClient = useQueryClient();
    const [selectedReviewerId, setSelectedReviewerId] = useState<number | null>(null);

    const { data: reviewers = [], isLoading } = useQuery({
        queryKey: ["users", "REVIEWER"],
        queryFn: () => getUsersApi("REVIEWER"),
        enabled: open,
    });

    const { mutate: assign, isPending, isError, error } = useMutation({
        mutationFn: () => assignReviewerApi(proposal.id, selectedReviewerId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
            queryClient.invalidateQueries({ queryKey: ["proposal", proposal.id] });
            setSelectedReviewerId(null);
            onClose();
        },
        onError: (err: any) => {
            console.error("Assignment failed:", err);
        },
    });

    const alreadyAssignedIds = new Set(
        proposal.assignments?.map((a) => a.reviewerId) ?? []
    );

    const handleClose = () => {
        setSelectedReviewerId(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent 
  className="w-[480px] max-w-[95vw]"
  aria-describedby={undefined}
>
                <DialogHeader>
                    <DialogTitle>Assign reviewer</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                        {proposal.title}
                    </p>
                </DialogHeader>

                <div className="py-2">
                    {isLoading ? (
                        <div className="flex flex-col gap-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                            ))}
                        </div>
                    ) : reviewers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No reviewers found.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                            {reviewers.map((reviewer) => {
                                const isAssigned = alreadyAssignedIds.has(reviewer.id);
                                const isSelected = selectedReviewerId === reviewer.id;

                                return (
                                    <button
                                        key={reviewer.id}
                                        disabled={isAssigned}
                                        onClick={() => setSelectedReviewerId(reviewer.id)}
                                        className={`
                      flex items-center justify-between gap-3 w-full
                      rounded-lg border px-4 py-3 text-left
                      transition-all duration-150
                      ${isAssigned
                                                ? "opacity-50 cursor-not-allowed bg-muted"
                                                : isSelected
                                                    ? "border-orange-400 bg-orange-50"
                                                    : "hover:border-orange-300 hover:bg-muted/40"
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-semibold text-orange-700">
                                                    {reviewer.name[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {reviewer.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {reviewer.email}
                                                </p>
                                            </div>
                                        </div>

                                        {isAssigned ? (
                                            <span className="text-xs text-muted-foreground shrink-0">
                                                Already assigned
                                            </span>
                                        ) : isSelected ? (
                                            <span className="w-4 h-4 rounded-full bg-orange-500 shrink-0" />
                                        ) : (
                                            <span className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center gap-2 sm:justify-end">
                    {isError && (
                        <p className="text-xs text-red-500 mr-auto">
                            {(error as any)?.response?.data?.message ?? "Failed to assign reviewer. Try again."}
                        </p>
                    )}
                    <Button variant="outline" onClick={handleClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 whitespace-nowrap"
                        disabled={!selectedReviewerId || isPending}
                        onClick={() => assign()}
                    >
                        {isPending ? "Assigning..." : "Assign reviewer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AssignReviewerModal;