import { useParams } from 'react-router-dom'

export const TicketDetailPage = (props: unknown) => {
    const { ticketId } = useParams<{ ticketId: string }>()

    return (
        <div>{ticketId}</div>
    )
}
