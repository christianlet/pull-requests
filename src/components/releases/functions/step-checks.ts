import { Release } from '../../../types/releases/release'

export const stepChecks = (step: keyof Release['steps'], release: Release) => {
    switch (step) {
        case 'qa':
            return qaStepIsReady(release)
        case 'regression':
            return regressionStepIsReady(release)
        default:
            break;
    }

    return {
        ready: false,
        message: ['Step check not found']
    }
}

const qaStepIsReady = (release: Release) => {
    const personalBranches = release.branches.filter(pr => pr.head.ref.includes('personal'))

    if(!personalBranches.length) {
        return {
            ready: false,
            message: ['No personal branches found']
        }
    }

    let ready = true
    let message: string[] = []

    for (const pr of personalBranches) {
        if(!pr.merged && pr.base.ref.match(/^collab\/.*\/release\/.*$/) === null) {
            ready = false
            message.push(`${pr.base.repo.name} is not pointing to a release branch`)
        } else if(!pr.merged) {
            ready = false
            message.push(`${pr.base.repo.name} is not merged`)
        }
    }

    return {
        ready,
        message
    }
}

const regressionStepIsReady = (release: Release) => {
    const releaseBranches = release.branches.filter(pr => pr.head.ref.match(/^collab\/.*\/release\/.*$/))

    if(!releaseBranches.length) {
        return {
            ready: false,
            message: ['No release branches found']
        }
    }

    let ready = true
    let message: string[] = []

    for (const branch of releaseBranches) {
        if(!branch.merged) {
            ready = false
            message.push(`${branch.base.repo.name} is not merged`)
        }
    }

    return {
        ready,
        message
    }
}
