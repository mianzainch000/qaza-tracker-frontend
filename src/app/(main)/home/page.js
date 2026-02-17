import React from 'react'
import Home from './template'

const HomePage = () => {
    return (
        <Home />
    )
}

export default HomePage

export function generateMetadata() {
    return { title: "Home" };
}
