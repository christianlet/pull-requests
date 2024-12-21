import { TicketsState } from '../../types/api-types';

export interface ActionDialogProps {
    ticket: TicketsState
    closeDialog: () => void
    refresh?: (time: number) => void
}