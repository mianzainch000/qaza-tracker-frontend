import React from 'react'
import History from './template'

const HistoryPage = () => {
    return (
        <History />
    )
}

export default HistoryPage

export function generateMetadata() {
    return { title: "History" };
}