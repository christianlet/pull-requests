import { Close, ExpandMore } from '@mui/icons-material'
import { Accordion, AccordionDetails, AccordionSummary, createStyles, Dialog, DialogContent, DialogTitle, Divider, IconButton, makeStyles, Slide, Tab, Tabs, Theme, Typography, useTheme } from '@mui/material'
import { green, pink } from '@mui/material/colors'
import { Box } from '@mui/system'
import { Octokit } from '@octokit/rest'
import React, { useEffect, useState } from 'react'
import { ActionDialogProps } from '.'

export const Diffs = (props: ActionDialogProps) => {
    const octokit = new Octokit({ auth: process.env.REACT_APP_PAT })
    const [tab, setTab] = useState(props.ticket.repos[0].id)
    const [files, setFiles] = useState<any[]>([])
    const theme = useTheme()

    useEffect(() => {
        const repo = props.ticket.repos.filter(r => r.id === tab).pop()

        if(repo) {
            octokit.pulls.listFiles({
                owner: repo.owner,
                repo: repo.repo,
                pull_number: repo.number
            })
                .then(({ data }) => setFiles(data))
        }

        return () => {
            setFiles([])
        }
    }, [tab])

    return (
        <Dialog
            open={props.ticket !== null}
            onClose={props.closeDialog}
            fullWidth={true}
            maxWidth="xl"
            scroll="body"
            transitionDuration={undefined}
            PaperProps={{
                style: {
                    verticalAlign: 'top',
                    minHeight: 500
                }
            }}
        >
            <DialogTitle>
                Diff Tool
                <IconButton
                    aria-label="close"
                    onClick={props.closeDialog}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme => theme.palette.grey[500],
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ backgroundColor: theme.palette.grey[50]}}>
                <Tabs
                    value={tab}
                    onChange={(e, val) => setTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {
                        props.ticket.repos.map((repo, i) => (
                            <Tab
                                value={repo.id}
                                label={repo.repo}
                                sx={{
                                    backgroundColor: theme.palette.grey[300]
                                }}
                            />
                        ))
                    }
                </Tabs>
                <Box
                    sx={{
                        margin: '25px',
                        padding: 2
                    }}
                >
                    {
                        files.filter(f => f.patch).map(file => (
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    sx={{
                                        backgroundColor: theme.palette.grey[300],
                                    }}
                                >
                                    <Typography>{file.filename}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ overflowX: 'auto' }}>
                                    {
                                        file.patch?.split('\n').map((line: string) => {
                                            const bgColor = line[0] === '+'
                                                ? green['A100']
                                                : line[0] === '-'
                                                    ? pink[50]
                                                    : 'white'
                                            return (
                                                <Typography sx={{
                                                    overflow: 'visible',
                                                    whiteSpace: 'pre-wrap',
                                                    backgroundColor: bgColor
                                                }}>
                                                    {line.replace(/@@/g, '\n')}
                                                </Typography>
                                            )
                                        })
                                    }
                                </AccordionDetails>
                            </Accordion>
                        ))
                    }
                </Box>
            </DialogContent>
        </Dialog>
    )
}
