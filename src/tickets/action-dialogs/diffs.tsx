import React, { useEffect, useState } from 'react'
import { Close, ExpandMore } from '@mui/icons-material'
import { Accordion, AccordionDetails, AccordionSummary, Dialog, DialogContent, DialogTitle, Divider, IconButton, Tab, Tabs, Typography, useTheme } from '@mui/material'
import { green, pink } from '@mui/material/colors'
import { Box } from '@mui/system'
import { ActionDialogProps } from '.'
import { useListFiles } from '../../hooks/list-files'

export const Diffs = (props: ActionDialogProps) => {
    const [tab, setTab] = useState(props.ticket.repos[0].id)
    const [repo, setRepo] = useState(props.ticket.repos.filter(r => r.id === tab).pop())
    const files = useListFiles(repo!.owner, repo!.repo, repo!.number)
    const theme = useTheme()

    useEffect(() => {
        const r = props.ticket.repos.filter(r => r.id === tab).pop()

        if(r) {
            setRepo(r)
        }
    }, [tab, props.ticket.repos])

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
            <DialogContent>
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
                                    bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.300'
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
                        files?.filter(f => f.patch).map(file => (
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    sx={{
                                        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.300'
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
                                                    backgroundColor: bgColor,
                                                    color: 'black'
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
