
export const storePR = (id: number, data: any) => {
    const PRs = getLocalPRs() ?? []
    let update = false

    PRs.forEach((pr, index) => {
        if(pr.id === id) {
            PRs[index] = data
            update = true
        }
    });

    if( !update ) {
        PRs.push(data)
    }

    sessionStorage.setItem('peerReviews', JSON.stringify(PRs))
}

export const getLocalPRs = (): {[index:string]: any}[]|null => {
    const data = sessionStorage.getItem('peerReviews')

    if(data) {
        return JSON.parse(data)
    }

    return null
}

export const getPR = (id: number): {[index:string]: any}|null => {
    let peerReviews = sessionStorage.getItem('peerReviews')

    if( peerReviews ) {
        const peerReviewsArray: any[] = JSON.parse(peerReviews)
        const peerReview = peerReviewsArray.filter(pr => pr.id === id)?.pop() ?? null

        if(peerReview) {
            return peerReview
        }
    }

    return null
}

export const removeClosedPeerReviews = (fetchedPRs: any[]) => {
    const storedPRs = getLocalPRs()

    if( storedPRs ) {
        let newStoredPRs = [...storedPRs]
        let i = 0

        for (const storedPR of storedPRs) {
            const exists = fetchedPRs.filter(fetchedPR => fetchedPR.id === storedPR.id).length > 0

            if( !exists ) {
                newStoredPRs.splice(i, 1)
            }

            i++
        }

        sessionStorage.setItem('peerReviews', JSON.stringify(newStoredPRs))
    }
}