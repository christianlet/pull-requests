import { TicketsState } from '..';

export interface ActionDialogProps {
    ticket: TicketsState
    closeDialog: () => void
}